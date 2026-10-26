import { storage, client } from '../../lib/appwrite/client';
import { ID } from 'appwrite';

export const BUCKETS = {
  AVATARS: 'avatars',
  VEHICLES: 'vehicle-images',
  SERVICE_RECEIPTS: 'service-receipts',
  DIAGNOSTICS: 'diagnostics',
};

export const storageService = {
  async uploadFile(bucketId: string, file: File, permissions?: string[], fileId: string = ID.unique()) {
    return await storage.createFile(bucketId, fileId, file, permissions);
  },

  async getFile(bucketId: string, fileId: string) {
    return await storage.getFile(bucketId, fileId);
  },

  async getFilePreview(bucketId: string, fileId: string) {
    return storage.getFilePreview(bucketId, fileId);
  },

  async getFileDownload(bucketId: string, fileId: string) {
    return storage.getFileDownload(bucketId, fileId);
  },

  async getFileView(bucketId: string, fileId: string) {
    return storage.getFileView(bucketId, fileId);
  },

  async deleteFile(bucketId: string, fileId: string) {
    return await storage.deleteFile(bucketId, fileId);
  }
};
