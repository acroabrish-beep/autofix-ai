export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface DiagnosticResponse {
  symptoms: string[];
  possibleCauses: string[];
  recommendations: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface AIService {
  sendMessage(messages: AIMessage[]): Promise<string>;
  startDiagnostic(symptoms: string): Promise<DiagnosticResponse>;
  analyzeDiagnostic(sessionId: string): Promise<string>;
  generateLearningExplanation(topic: string, level: string): Promise<string>;
}
