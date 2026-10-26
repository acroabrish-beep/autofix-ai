import { useState } from 'react';
import { storageService, BUCKETS } from '../services/storage';
import { Permission, Role } from 'appwrite';
import { useAuth } from '../contexts/AuthContext';

export const useStorage = () => {
  const { user } = useAuth();
  const [uploading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (bucketId: string, file: File) => {
    if (!user) {
      throw new Error('User must be authenticated to upload files');
    }

    setLoading(true);
    setError(null);

    try {
      // Set permissions so only the owner can manage the file
      const permissions = [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ];

      const response = await storageService.uploadFile(bucketId, file, permissions);
      return response;
    } catch (err: any) {
      setError(err.message || 'File upload failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (bucketId: string, fileId: string) => {
    setLoading(true);
    setError(null);
    try {
      await storageService.deleteFile(bucketId, fileId);
    } catch (err: any) {
      setError(err.message || 'File deletion failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getFilePreview = (bucketId: string, fileId: string) => {
    return storageService.getFilePreview(bucketId, fileId).toString();
  };

  const getFileView = (bucketId: string, fileId: string) => {
    return storageService.getFileView(bucketId, fileId).toString();
  };

  return {
    uploadFile,
    deleteFile,
    getFilePreview,
    getFileView,
    uploading,
    error,
    BUCKETS
  };
};
