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
    role?: UserRole;
    institutionId?: string;
    garageId?: string;
    phone?: string;
    specialization?: string;
    privileged?: boolean;
  }): Promise<UserProfile> {
    // Non-privileged callers (such as public registration) can only create a
    // standard student profile. Privileged fields are ignored unless an admin
    // flow explicitly opts in.
    const privileged = data.privileged === true;

    const profileData: Record<string, any> = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: privileged ? data.role || 'student' : 'student',
      avatarFileId: '',
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (privileged) {
      if (data.institutionId) profileData.institutionId = data.institutionId;
      if (data.garageId) profileData.garageId = data.garageId;
    }
    if (data.phone) profileData.phone = data.phone;
    if (data.specialization) profileData.specialization = data.specialization;

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

  async updateProfile(
    profileId: string,
    data: Partial<UserProfile>,
    options?: { privileged?: boolean }
  ): Promise<UserProfile> {
    const privileged = options?.privileged === true;
    const updateData: Record<string, any> = { ...data };

    // Prevent non-privileged client flows from escalating roles or moving a
    // profile between tenants.
    if (!privileged) {
      delete updateData.role;
      delete updateData.institutionId;
      delete updateData.garageId;
    }

    return await databaseService.updateDocument<UserProfile>(
      COLLECTIONS.PROFILES,
      profileId,
      {
        ...updateData,
        updatedAt: new Date().toISOString(),
      }
    );
  }
};
