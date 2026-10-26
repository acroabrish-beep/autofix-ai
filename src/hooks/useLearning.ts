import { useState, useEffect, useCallback } from 'react';
import { learningService } from '../services/database/learning';
import { LearningModule, LearningProgress } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useLearning = (moduleId?: string) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [currentModule, setCurrentModule] = useState<LearningModule | null>(null);
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = useCallback(async (category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await learningService.listModules(category);
      setModules(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load learning modules');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchModuleDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await learningService.getModule(id);
      setCurrentModule(data);
      if (user) {
        const prog = await learningService.getProgress(user.$id, id);
        setProgress(prog);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load module details');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProgress = async (percent: number) => {
    if (!user || !moduleId) return;
    try {
      const newProgress = await learningService.updateProgress(user.$id, moduleId, percent);
      setProgress(newProgress);
    } catch (err: any) {
      console.error('Failed to update progress:', err);
    }
  };

  useEffect(() => {
    if (moduleId) {
      fetchModuleDetail(moduleId);
    } else {
      fetchModules();
    }
  }, [moduleId, fetchModuleDetail, fetchModules]);

  return {
    modules,
    currentModule,
    progress,
    loading,
    error,
    fetchModules,
    updateProgress,
  };
};
