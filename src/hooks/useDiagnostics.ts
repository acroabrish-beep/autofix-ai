import { useState, useCallback, useEffect } from 'react';
import { diagnosticService } from '../services/ai';
import { diagnosticsService } from '../services/database/diagnostics';
import { useAuth } from '../contexts/AuthContext';
import { DiagnosticRequest, DiagnosticResponse, DiagnosticSession } from '../types';

export const useDiagnostics = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<DiagnosticSession[]>([]);
  const [currentSession, setCurrentSession] = useState<DiagnosticSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await diagnosticsService.listUserSessions(user.$id);
      setSessions(data);
    } catch (err: any) {
      console.error('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const analyzeSymptoms = async (request: DiagnosticRequest) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Call AI Service
      const result = await diagnosticService.analyzeSymptoms(request);

      // 2. Save Session to Appwrite
      const session = await diagnosticsService.saveSession(user.$id, {
        vehicleId: request.vehicleId,
        userInput: request.description,
        requestData: request,
        result: result,
        status: 'active'
      });

      setCurrentSession(session);
      return session;
    } catch (err: any) {
      setError(err.message || 'Diagnostic analysis failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    sessions,
    currentSession,
    loading,
    error,
    analyzeSymptoms,
    fetchHistory,
    setCurrentSession
  };
};
