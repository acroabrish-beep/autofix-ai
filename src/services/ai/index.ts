import { client } from '../../lib/appwrite/client';
import i18n from '../../lib/i18n';
import {
  DiagnosticRequest,
  DiagnosticResponse,
  PossibleCause,
  RecommendedCheck,
} from '../../types';
import { Functions } from 'appwrite';
import { parseChatResponse } from './chat';

const functions = new Functions(client);

/**
 * Appwrite Function that powers the AI features.
 *
 * Diagnostics reuses the deployed `chat-ai` function, which accepts
 * `{ "message": string }` and returns `{ "reply": string }`.
 */
const DIAGNOSTIC_FUNCTION_ID = '6ad66bab003e47ee0af3';

const friendlyErrorMessage = () => i18n.t('diagnostics.service_unavailable');

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  );
}

function toPossibleCauses(value: unknown): PossibleCause[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): PossibleCause | null => {
      if (!item || typeof item !== 'object') return null;
      const cause = item as Record<string, unknown>;
      if (typeof cause.title !== 'string' || !cause.title.trim()) return null;

      return {
        title: cause.title.trim(),
        description:
          typeof cause.description === 'string' ? cause.description.trim() : '',
        probability:
          typeof cause.probability === 'number'
            ? Math.min(1, Math.max(0, cause.probability))
            : 0.5,
      };
    })
    .filter((item): item is PossibleCause => item !== null);
}

function toRecommendedChecks(value: unknown): RecommendedCheck[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item): RecommendedCheck | null => {
      if (!item || typeof item !== 'object') return null;
      const check = item as Record<string, unknown>;
      if (typeof check.title !== 'string' || !check.title.trim()) return null;

      return {
        title: check.title.trim(),
        description:
          typeof check.description === 'string' ? check.description.trim() : '',
        toolsRequired: toStringArray(check.toolsRequired),
      };
    })
    .filter((item): item is RecommendedCheck => item !== null);
}

/**
 * The chat function normally returns free-form guidance. If the model happens
 * to return the structured diagnostic JSON, keep the rich rendering.
 */
function parseStructuredDiagnosis(reply: string): DiagnosticResponse | null {
  const cleaned = reply
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  if (!cleaned.startsWith('{')) return null;

  try {
    const data = JSON.parse(cleaned) as Record<string, unknown>;
    if (!data || typeof data !== 'object' || typeof data.summary !== 'string') {
      return null;
    }

    const confidence =
      typeof data.confidence === 'number'
        ? Math.min(1, Math.max(0, data.confidence))
        : 0.5;

    return {
      summary: data.summary.trim(),
      possibleCauses: toPossibleCauses(data.possibleCauses),
      recommendedChecks: toRecommendedChecks(data.recommendedChecks),
      nextSteps: toStringArray(data.nextSteps),
      safetyNotes: toStringArray(data.safetyNotes),
      confidence,
      disclaimer:
        typeof data.disclaimer === 'string' && data.disclaimer.trim()
          ? data.disclaimer.trim()
          : i18n.t('diagnostics.disclaimer'),
    };
  } catch {
    return null;
  }
}

function toDiagnosticResponse(reply: string): DiagnosticResponse {
  const structured = parseStructuredDiagnosis(reply);
  if (structured) return structured;

  return {
    summary: reply,
    possibleCauses: [],
    recommendedChecks: [],
    nextSteps: [],
    safetyNotes: [],
    confidence: 0.5,
    disclaimer: i18n.t('diagnostics.disclaimer'),
  };
}

export const diagnosticService = {
  async analyzeSymptoms(request: DiagnosticRequest): Promise<DiagnosticResponse> {
    try {
      const execution = await functions.createExecution(
        DIAGNOSTIC_FUNCTION_ID,
        JSON.stringify({ message: request.description })
      );

      const statusCode = execution.responseStatusCode ?? 0;
      if (execution.status === 'failed' || statusCode >= 400) {
        console.warn('[diagnostics] AI function execution failed:', {
          status: execution.status,
          statusCode,
          body: execution.responseBody,
        });
        throw new Error(friendlyErrorMessage());
      }

      // Support a function that returns the structured diagnostic object
      // directly, as well as the chat function's `{ reply: "..." }` shape.
      const directResponse = parseStructuredDiagnosis(execution.responseBody ?? '');
      if (directResponse) return directResponse;

      const reply = parseChatResponse(execution.responseBody);
      if (!reply) {
        console.warn(
          '[diagnostics] AI function returned an empty response:',
          execution.responseBody
        );
        throw new Error(friendlyErrorMessage());
      }

      return toDiagnosticResponse(reply);
    } catch (error) {
      // Never surface raw Appwrite/404 errors to the user.
      console.error('[diagnostics] AI service error:', error);
      throw new Error(friendlyErrorMessage());
    }
  },
};

export * from './types';
export * from './provider';
