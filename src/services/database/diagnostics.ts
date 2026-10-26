import { databaseService, COLLECTIONS, Query } from './index';
import { DiagnosticSession } from '../../types';
import { Permission, Role } from 'appwrite';

export const diagnosticsService = {
  async listUserSessions(userId: string): Promise<DiagnosticSession[]> {
    const sessions = await databaseService.listDocuments<any>(
      COLLECTIONS.DIAGNOSTIC_SESSIONS,
      [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
    );

    // Parse JSON fields
    return sessions.map(s => ({
      ...s,
      requestData: typeof s.requestData === 'string' ? JSON.parse(s.requestData) : s.requestData,
      result: typeof s.result === 'string' ? JSON.parse(s.result) : s.result
    })) as DiagnosticSession[];
  },

  async saveSession(userId: string, data: Omit<DiagnosticSession, keyof import('appwrite').Models.Document | 'userId'>): Promise<DiagnosticSession> {
    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];

    // Stringify JSON fields for Appwrite storage
    const payload = {
      ...data,
      userId,
      requestData: JSON.stringify(data.requestData),
      result: JSON.stringify(data.result),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const session = await databaseService.createDocument<any>(
      COLLECTIONS.DIAGNOSTIC_SESSIONS,
      payload,
      permissions
    );

    return {
      ...session,
      requestData: JSON.parse(session.requestData),
      result: JSON.parse(session.result)
    } as DiagnosticSession;
  },

  async getSession(sessionId: string): Promise<DiagnosticSession> {
    const session = await databaseService.getDocument<any>(
      COLLECTIONS.DIAGNOSTIC_SESSIONS,
      sessionId
    );

    return {
      ...session,
      requestData: typeof session.requestData === 'string' ? JSON.parse(session.requestData) : session.requestData,
      result: typeof session.result === 'string' ? JSON.parse(session.result) : session.result
    } as DiagnosticSession;
  }
};
