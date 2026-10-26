import { client } from '../../lib/appwrite/client';
import { DiagnosticRequest, DiagnosticResponse } from '../../types';
import { Functions } from 'appwrite';

const functions = new Functions(client);
const DIAGNOSTIC_FUNCTION_ID = 'diagnostic-ai';

export const diagnosticService = {
  async analyzeSymptoms(request: DiagnosticRequest): Promise<DiagnosticResponse> {
    try {
      const execution = await functions.createExecution(
        DIAGNOSTIC_FUNCTION_ID,
        JSON.stringify(request)
      );

      if (execution.status === 'failed') {
        throw new Error('AI analysis failed. Please check backend logs.');
      }

      const response: DiagnosticResponse = JSON.parse(execution.responseBody);
      return response;
    } catch (error: any) {
      console.error('AI Service Error:', error);
      if (error.message?.includes('not found')) {
        throw new Error('AI diagnostics is not configured yet.');
      }
      throw new Error(error.message || 'Failed to analyze symptoms');
    }
  }
};

export * from './types';
export * from './provider';
