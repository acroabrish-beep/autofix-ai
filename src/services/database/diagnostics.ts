import { databaseService, COLLECTIONS, Query } from './index';
import { DiagnosticSession, DiagnosticResponse } from '../../types';
import { Permission, Role } from 'appwrite';

function parseDiagnosticResponse(value: unknown): DiagnosticResponse {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as DiagnosticResponse;
    } catch {
      return {
        summary: value,
        possibleCauses: [],
        recommendedChecks: [],
        nextSteps: [],
        safetyNotes: [],
        confidence: 0.5,
        disclaimer: '',
      };
    }
  }

  if (value && typeof value === 'object') {
    return value as DiagnosticResponse;
  }

  return {
    summary: '',
    possibleCauses: [],
    recommendedChecks: [],
    nextSteps: [],
    safetyNotes: [],
    confidence: 0.5,
    disclaimer: '',
  };
}

export const diagnosticsService = {
  async listUserSessions(userId: string): Promise<DiagnosticSession[]> {
    const sessions = await databaseService.listDocuments<any>(
      COLLECTIONS.DIAGNOSTIC_SESSIONS,
      [Query.equal('userId', userId), Query.orderDesc('$createdAt')]
    );

    return sessions.map((s) => {
      const description = typeof s.description === 'string' ? s.description : '';
      const aiResponse =
        typeof s.aiResponse === 'string' ? s.aiResponse : JSON.stringify(s.aiResponse ?? {});

      return {
        ...s,
        userId: s.userId,
        vehicleId: s.vehicleId,
        description,
        aiResponse,
        result: parseDiagnosticResponse(aiResponse || s.result),
        userInput: description,
        requestData: s.requestData ?? {
          vehicleId: s.vehicleId,
          description,
          symptoms: [],
          timing: 'Recently',
          warningLights: [],
        },
        status: s.status ?? 'active',
      } as DiagnosticSession;
    });
  },

  async saveSession(
    userId: string,
    data: Omit<DiagnosticSession, keyof import('appwrite').Models.Document | 'userId'>
  ): Promise<DiagnosticSession> {
    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];

    const description =
      data.description ?? data.userInput ?? data.requestData?.description ?? '';
    const result = data.result ?? parseDiagnosticResponse(data.aiResponse);
    const aiResponse = data.aiResponse ?? JSON.stringify(result);

    const payload = {
      userId,
      vehicleId: data.vehicleId,
      description,
      aiResponse,
      institutionId: data.institutionId || '',
    };

    const session = await databaseService.createDocument<any>(
      COLLECTIONS.DIAGNOSTIC_SESSIONS,
      payload,
      permissions
    );

    return {
      ...session,
      userId,
      vehicleId: data.vehicleId,
      description,
      aiResponse,
      result,
      userInput: description,
      requestData: data.requestData ?? {
        vehicleId: data.vehicleId,
        description,
        symptoms: [],
        timing: 'Recently',
        warningLights: [],
      },
      status: data.status ?? 'active',
    } as DiagnosticSession;
  },

  async getSession(sessionId: string): Promise<DiagnosticSession> {
    const session = await databaseService.getDocument<any>(
      COLLECTIONS.DIAGNOSTIC_SESSIONS,
      sessionId
    );

    const description =
      typeof session.description === 'string' ? session.description : '';
    const aiResponse =
      typeof session.aiResponse === 'string'
        ? session.aiResponse
        : JSON.stringify(session.aiResponse ?? {});

    return {
      ...session,
      userId: session.userId,
      vehicleId: session.vehicleId,
      description,
      aiResponse,
      result: parseDiagnosticResponse(aiResponse || session.result),
      userInput: description,
      requestData: session.requestData ?? {
        vehicleId: session.vehicleId,
        description,
        symptoms: [],
        timing: 'Recently',
        warningLights: [],
      },
      status: session.status ?? 'active',
    } as DiagnosticSession;
  }
};
