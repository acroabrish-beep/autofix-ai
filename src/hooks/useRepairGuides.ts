import { useState, useEffect, useCallback } from 'react';
import { repairGuidesService } from '../services/database/repairGuides';
import { findMockRepairGuide } from '../data/mockRepairGuides';
import { RepairGuide } from '../types';

export const useRepairGuides = (guideId?: string) => {
  const [guides, setGuides] = useState<RepairGuide[]>([]);
  const [currentGuide, setCurrentGuide] = useState<RepairGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGuides = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await repairGuidesService.listGuides(category);
      setGuides(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load repair guides');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGuideDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setCurrentGuide(null);

    // Demo ids never exist in Appwrite — render the bundled guide directly.
    if (id.startsWith('demo-')) {
      const mock = findMockRepairGuide(id);
      if (mock) {
        setCurrentGuide(mock);
        setLoading(false);
        return;
      }
    }

    try {
      const data = await repairGuidesService.getGuide(id);
      setCurrentGuide(data);
    } catch (err: any) {
      // Fall back to local data when the document is missing or the request fails.
      const mock = findMockRepairGuide(id);
      if (mock) {
        setCurrentGuide(mock);
      } else {
        setError(err?.message || 'Failed to load guide details');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (guideId) {
      fetchGuideDetail(guideId);
    } else {
      fetchGuides();
    }
  }, [guideId, fetchGuideDetail, fetchGuides]);

  return {
    guides,
    currentGuide,
    loading,
    error,
    fetchGuides,
    fetchGuideDetail
  };
};
