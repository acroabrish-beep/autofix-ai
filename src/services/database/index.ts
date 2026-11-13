import { databases, DATABASE_ID, CHAT_COLLECTION_ID } from '../../lib/appwrite';
import { Query } from 'appwrite';

// Re-export so existing `import { DATABASE_ID } from './index'` keeps working.
export { DATABASE_ID };

export const COLLECTIONS = {
  PROFILES: 'profiles',
  LEARNING_MODULES: 'learning_modules',
  LEARNING_PROGRESS: 'learning_progress',
  DIAGNOSTIC_SESSIONS: 'diagnostic_sessions',
  VEHICLES: 'vehicles',
  REPAIR_GUIDES: 'repair_guides',
  SERVICE_RECORDS: 'service_records',
  CHAT_HISTORY: CHAT_COLLECTION_ID,
  SCHOOLS: 'schools',
  GARAGES: 'garages',
  APPLICATIONS: 'applications',
  ASSIGNMENTS: 'assignments',
  SUBMISSIONS: 'submissions',
  SERVICE_REQUESTS: 'service_requests',
  AUDIT_LOGS: 'audit_logs',
  DEPARTMENTS: 'departments',
  PROGRAMS: 'programs',
  CERTIFICATES: 'certificates',
  PAYMENTS: 'payments',
};

export const databaseService = {
  async getDocument<T>(collectionId: string, documentId: string): Promise<T> {
    return await databases.getDocument(DATABASE_ID, collectionId, documentId) as T;
  },

  async listDocuments<T>(collectionId: string, queries: string[] = []): Promise<T[]> {
    const response = await databases.listDocuments(DATABASE_ID, collectionId, queries);
    return response.documents as T[];
  },

  async createDocument<T>(collectionId: string, data: any, permissions?: string[], documentId: string = 'unique()'): Promise<T> {
    return await databases.createDocument(DATABASE_ID, collectionId, documentId, data, permissions) as T;
  },

  async updateDocument<T>(collectionId: string, documentId: string, data: any, permissions?: string[]): Promise<T> {
    return await databases.updateDocument(DATABASE_ID, collectionId, documentId, data, permissions) as T;
  },

  async deleteDocument(collectionId: string, documentId: string) {
    return await databases.deleteDocument(DATABASE_ID, collectionId, documentId);
  },

  async countDocuments(collectionId: string, queries: string[] = []): Promise<number> {
    const response = await databases.listDocuments(DATABASE_ID, collectionId, [...queries, Query.limit(1)]);
    return response.total;
  }
};

export { Query };
