import { databaseService, COLLECTIONS, Query } from './index';
import { RepairGuide } from '../../types';

export const repairGuidesService = {
  async listGuides(category?: string): Promise<RepairGuide[]> {
    const queries = [];
    if (category) {
      queries.push(Query.equal('category', category));
    }
    return await databaseService.listDocuments<RepairGuide>(
      COLLECTIONS.REPAIR_GUIDES,
      queries
    );
  },

  async getGuide(guideId: string): Promise<RepairGuide> {
    return await databaseService.getDocument<RepairGuide>(
      COLLECTIONS.REPAIR_GUIDES,
      guideId
    );
  }
};
