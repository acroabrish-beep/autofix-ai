import { databases, DATABASE_ID, ID } from '../../lib/appwrite';
import { Query, Permission, Role } from 'appwrite';
import { UserVehicle } from '../../types';
import { COLLECTIONS } from './index';

/**
 * Service for the free-text `vehicles` collection.
 *
 * Expected attributes:
 *   userId  string
 *   make    string
 *   model   string
 *   year    string
 *   engine  string (optional)
 */
export const userVehiclesService = {
  async listUserVehicles(userId: string): Promise<UserVehicle[]> {
    const response = await databases.listDocuments<UserVehicle>(
      DATABASE_ID,
      COLLECTIONS.VEHICLES,
      [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
    );

    return response.documents;
  },

  async addVehicle(
    userId: string,
    data: { make: string; model: string; year: string | number; engine?: string }
  ): Promise<UserVehicle> {
    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];

    const document = await databases.createDocument<UserVehicle>(
      DATABASE_ID,
      COLLECTIONS.VEHICLES,
      ID.unique(),
      {
        userId,
        make: data.make,
        model: data.model,
        year: String(data.year),
        engine: data.engine ?? '',
      },
      permissions
    );

    return document;
  },
};
