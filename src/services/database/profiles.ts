import { databaseService, COLLECTIONS, Query } from './index';
import { UserProfile, UserRole } from '../../types';
import { Permission, Role } from 'appwrite';

export const profilesService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profiles = await databaseService.listDocuments<UserProfile>(
        COLLECTIONS.PROFILES,
        [Query.equal('userId', userId)]
      );
      return profiles.length > 0 ? profiles[0] : null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  async createProfile(data: {
    userId: string;
    fullName: string;
    email: string;
    role: UserRole;
  }): Promise<UserProfile> {
    const profileData = {
      ...data,
      avatarFileId: '',
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Set permissions so only the user can read/update their profile
    const permissions = [
      Permission.read(Role.user(data.userId)),
      Permission.update(Role.user(data.userId)),
    ];

    return await databaseService.createDocument<UserProfile>(
      COLLECTIONS.PROFILES,
      profileData,
      permissions
    );
  },

  async updateProfile(profileId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return await databaseService.updateDocument<UserProfile>(
      COLLECTIONS.PROFILES,
      profileId,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      }
    );
  }
};
