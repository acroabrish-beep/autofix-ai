import { databaseService, COLLECTIONS, Query } from './index';
import { UserProfile } from '../../types';
import { runStaffFunction } from '../staffInvitations';

export const profilesService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const profiles = await databaseService.listDocuments<UserProfile>(COLLECTIONS.PROFILES, [Query.equal('userId', userId)]);
      return profiles.length > 0 ? profiles[0] : null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },
  async createProfile(_data: { userId: string; fullName: string; email: string; phone?: string }): Promise<UserProfile> {
    const result = await runStaffFunction<{ profile: UserProfile }>('bootstrap_student');
    return result.profile;
  },
  async updateProfile(_profileId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return await runStaffFunction<UserProfile>('update_self_profile', data);
  },
  async inviteStaff(data: {
    fullName: string; email: string; role: 'instructor' | 'mechanic';
    phone?: string; specialization?: string; tenantId?: string;
  }): Promise<{ userId: string; email: string; role: string; invitationSent: boolean }> {
    return await runStaffFunction('invite_staff', data);
  },
  async listStaff(): Promise<UserProfile[]> {
    return await runStaffFunction<UserProfile[]>('list_staff');
  },
  async listTenantProfiles(): Promise<UserProfile[]> {
    return await runStaffFunction<UserProfile[]>('list_tenant_profiles');
  },
  async listGlobalProfiles(): Promise<{ profiles: UserProfile[]; total: number }> {
    return await runStaffFunction<{ profiles: UserProfile[]; total: number }>('list_global_profiles');
  },
  async getServiceRequestDetails(requestId: string): Promise<{ vehicle: { make?: string; model?: string; year?: number | string; engine?: string } | null; owner: UserProfile | null }> {
    return await runStaffFunction('get_service_request_details', { requestId });
  },
};
