import { DiagnosticRequest, DiagnosticResponse } from '../../types';

export interface AIProvider {
  name: string;
  analyzeSymptoms(request: DiagnosticRequest): Promise<DiagnosticResponse>;
}
