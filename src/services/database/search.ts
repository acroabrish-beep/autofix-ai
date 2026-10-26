import { Query } from 'appwrite';
import { databaseService, COLLECTIONS } from './index';
import { LearningModule, RepairGuide, VehicleProfile, DiagnosticSession } from '../../types';

export interface GlobalSearchResults {
  academy: LearningModule[];
  repairs: RepairGuide[];
  garage: VehicleProfile[];
  diagnostics: DiagnosticSession[];
}

export const searchService = {
  async globalSearch(query: string, userId?: string): Promise<GlobalSearchResults> {
    const lowercaseQuery = query.toLowerCase();

    // We can't do full text search across everything in one query with Appwrite easily
    // So we'll fetch then filter, or use basic string queries if supported

    const [modules, guides] = await Promise.all([
      databaseService.listDocuments<LearningModule>(COLLECTIONS.LEARNING_MODULES, [
        Query.limit(50)
      ]),
      databaseService.listDocuments<RepairGuide>(COLLECTIONS.REPAIR_GUIDES, [
        Query.limit(50)
      ])
    ]);

    const results: GlobalSearchResults = {
      academy: modules.filter(m =>
        m.title.toLowerCase().includes(lowercaseQuery) ||
        m.description.toLowerCase().includes(lowercaseQuery)
      ),
      repairs: guides.filter(g =>
        g.title.toLowerCase().includes(lowercaseQuery) ||
        g.description.toLowerCase().includes(lowercaseQuery)
      ),
      garage: [],
      diagnostics: []
    };

    if (userId) {
      const [vehicles, sessions] = await Promise.all([
        databaseService.listDocuments<VehicleProfile>(COLLECTIONS.VEHICLES, [
          Query.equal('userId', userId)
        ]),
        databaseService.listDocuments<any>(COLLECTIONS.DIAGNOSTIC_SESSIONS, [
          Query.equal('userId', userId)
        ])
      ]);

      results.garage = vehicles.filter(v =>
        (v.make || '').toLowerCase().includes(lowercaseQuery) ||
        (v.model || '').toLowerCase().includes(lowercaseQuery)
      );

      results.diagnostics = sessions
        .filter(s => s.userInput.toLowerCase().includes(lowercaseQuery))
        .map(s => ({
          ...s,
          result: typeof s.result === 'string' ? JSON.parse(s.result) : s.result
        })) as DiagnosticSession[];
    }

    return results;
  }
};
