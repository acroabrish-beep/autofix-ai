import { databaseService, COLLECTIONS, Query } from './index';
import { UserProfile } from '../../types';
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

  /**
   * Public client registration can create student profiles only.
   * Staff roles and tenant assignments must be provisioned by a trusted
   * server-side invitation workflow, never by a browser-supplied flag.
   */
  async createProfile(data: {
    userId: string;
    fullName: string;
    email: string;
    phone?: string;
  }): Promise<UserProfile> {
    const now = new Date().toISOString();
    const profileData: Record<string, unknown> = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: 'student',
      avatarFileId: '',
      preferredLanguage: 'en',
      createdAt: now,
      updatedAt: now,
    };

    if (data.phone) profileData.phone = data.phone;

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

  /**
   * Client profile edits cannot change authorization or tenant ownership.
   * Those fields require a separately authenticated server-side workflow.
   */
  async updateProfile(
    profileId: string,
    data: Partial<UserProfile>
  ): Promise<UserProfile> {
    const updateData: Record<string, unknown> = { ...data };
    delete updateData.role;
    delete updateData.institutionId;
    delete updateData.garageId;
    delete updateData.userId;
    delete updateData.status;

    return await databaseService.updateDocument<UserProfile>(
      COLLECTIONS.PROFILES,
      profileId,
      {
        ...updateData,
        updatedAt: new Date().toISOString(),
      }
    );
  },
};
