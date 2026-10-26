import { databaseService, COLLECTIONS, Query } from './index';
import { LearningModule, LearningProgress } from '../../types';
import { Permission, Role } from 'appwrite';

export const learningService = {
  async listModules(): Promise<LearningModule[]> {
    return await databaseService.listDocuments<LearningModule>(
      COLLECTIONS.LEARNING_MODULES
    );
  },

  async getModule(moduleId: string): Promise<LearningModule> {
    return await databaseService.getDocument<LearningModule>(
      COLLECTIONS.LEARNING_MODULES,
      moduleId
    );
  },

  async getProgress(userId: string, moduleId: string): Promise<LearningProgress | null> {
    try {
      const results = await databaseService.listDocuments<LearningProgress>(
        COLLECTIONS.LEARNING_PROGRESS,
        [
          Query.equal('userId', userId),
          Query.equal('moduleId', moduleId)
        ]
      );
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      return null;
    }
  },

  async updateProgress(userId: string, moduleId: string, percent: number): Promise<LearningProgress> {
    const existing = await this.getProgress(userId, moduleId);

    const data = {
      userId,
      moduleId,
      progressPercent: percent,
      completed: percent >= 100,
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      if (data.completed && !existing.completed) {
        (data as any).completedAt = new Date().toISOString();
      }
      return await databaseService.updateDocument<LearningProgress>(
        COLLECTIONS.LEARNING_PROGRESS,
        existing.$id,
        data
      );
    } else {
      const permissions = [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
      ];
      (data as any).startedAt = new Date().toISOString();
      return await databaseService.createDocument<LearningProgress>(
        COLLECTIONS.LEARNING_PROGRESS,
        data,
        permissions
      );
    }
  }
};
