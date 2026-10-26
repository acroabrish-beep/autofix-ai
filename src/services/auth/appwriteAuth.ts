import { account, ID } from '../../lib/appwrite/client';
import { Models } from 'appwrite';

export const appwriteAuth = {
  async register(email: string, pass: string, name: string) {
    try {
      return await account.create(ID.unique(), email, pass, name);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  async login(email: string, pass: string) {
    try {
      return await account.createEmailPasswordSession(email, pass);
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  async logout() {
    try {
      return await account.deleteSession('current');
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  },

  async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    try {
      return await account.get();
    } catch (error) {
      return null;
    }
  },

  async getCurrentSession(): Promise<Models.Session | null> {
    try {
      return await account.getSession('current');
    } catch (error) {
      return null;
    }
  },

  async resetPassword(email: string) {
    try {
      // Note: This requires a landing page in the app to handle the reset
      const redirectUrl = `${window.location.origin}/reset-password`;
      return await account.createRecovery(email, redirectUrl);
    } catch (error: any) {
      throw new Error(error.message || 'Password reset request failed');
    }
  }
};
