import { databaseService, COLLECTIONS, Query } from './index';
import { ServiceRecord } from '../../types';
import { Permission, Role } from 'appwrite';

export const serviceHistoryService = {
  async listVehicleRecords(vehicleId: string): Promise<ServiceRecord[]> {
    return await databaseService.listDocuments<ServiceRecord>(
      COLLECTIONS.SERVICE_RECORDS,
      [Query.equal('vehicleId', vehicleId), Query.orderDesc('date')]
    );
  },

  async listUserRecords(userId: string): Promise<ServiceRecord[]> {
    return await databaseService.listDocuments<ServiceRecord>(
      COLLECTIONS.SERVICE_RECORDS,
      [Query.equal('userId', userId), Query.orderDesc('date')]
    );
  },

  async addRecord(userId: string, data: Omit<ServiceRecord, keyof import('appwrite').Models.Document | 'userId'>): Promise<ServiceRecord> {
    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];

    return await databaseService.createDocument<ServiceRecord>(
      COLLECTIONS.SERVICE_RECORDS,
      {
        ...data,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      permissions
    );
  },

  async updateRecord(recordId: string, data: Partial<ServiceRecord>): Promise<ServiceRecord> {
    return await databaseService.updateDocument<ServiceRecord>(
      COLLECTIONS.SERVICE_RECORDS,
      recordId,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      }
    );
  },

  async deleteRecord(recordId: string): Promise<void> {
    await databaseService.deleteDocument(COLLECTIONS.SERVICE_RECORDS, recordId);
  }
};
