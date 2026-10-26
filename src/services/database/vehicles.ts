import { databaseService, COLLECTIONS, Query } from './index';
import { VehicleProfile } from '../../types';
import { Permission, Role } from 'appwrite';

/**
 * Fields actually stored by the `vehicles` collection.
 *
 * Anything else (mileage, fuelType, notes, imageFileId) is intentionally
 * dropped so Appwrite never rejects the request with "Unknown attribute".
 */
export interface VehicleInput {
  make: string;
  model: string;
  year: string | number;
  engine?: string;
}

const toVehicleAttributes = (data: Partial<VehicleInput>): Record<string, string> => {
  const attributes: Record<string, string> = {};

  if (data.make !== undefined) attributes.make = data.make;
  if (data.model !== undefined) attributes.model = data.model;
  if (data.year !== undefined) attributes.year = String(data.year);
  if (data.engine !== undefined) attributes.engine = data.engine;

  return attributes;
};

export const vehiclesService = {
  async listUserVehicles(userId: string): Promise<VehicleProfile[]> {
    return await databaseService.listDocuments<VehicleProfile>(
      COLLECTIONS.VEHICLES,
      [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
    );
  },

  async getVehicle(vehicleId: string): Promise<VehicleProfile> {
    return await databaseService.getDocument<VehicleProfile>(
      COLLECTIONS.VEHICLES,
      vehicleId
    );
  },

  async addVehicle(
    userId: string,
    data: Partial<VehicleInput> & { make: string; model: string }
  ): Promise<VehicleProfile> {
    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];

    return await databaseService.createDocument<VehicleProfile>(
      COLLECTIONS.VEHICLES,
      {
        ...toVehicleAttributes(data),
        userId,
      },
      permissions
    );
  },

  async updateVehicle(
    vehicleId: string,
    data: Partial<VehicleInput>
  ): Promise<VehicleProfile> {
    return await databaseService.updateDocument<VehicleProfile>(
      COLLECTIONS.VEHICLES,
      vehicleId,
      toVehicleAttributes(data)
    );
  },

  async deleteVehicle(vehicleId: string): Promise<void> {
    await databaseService.deleteDocument(COLLECTIONS.VEHICLES, vehicleId);
  }
};
