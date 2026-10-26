import { client } from '../../lib/appwrite';
import i18n from '../../lib/i18n';
import { Functions } from 'appwrite';

const functions = new Functions(client);

/**
 * Appwrite Function that powers the in-app AI assistant.
 *
 * The function accepts `{ message: string }` and returns either a plain
 * text body or JSON such as `{ reply: string }`.
 */
const CHAT_FUNCTION_ID = '6ad66bab003e47ee0af3';

const fallbackReply = (message: string) =>
  i18n.t('dashboard.chat_fallback', {
    message: message.slice(0, 120),
    id: CHAT_FUNCTION_ID,
  });

/**
 * Extract a human-readable reply from an Appwrite function's `responseBody`.
 *
 * Handles:
 *  - plain text
 *  - JSON strings (`"hello"`)
 *  - `{ reply | response | message | text | answer | content | output }`
 *  - OpenAI shape `{ choices: [{ message: { content } }] }`
 *
 * Returns `null` when no usable text can be found.
 */
export function parseChatResponse(responseBody?: string | null): string | null {
  if (!responseBody) return null;

  const trimmed = responseBody.trim();
  if (!trimmed) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    // Not JSON — the function returned plain text.
    return trimmed;
  }

  if (typeof parsed === 'string') {
    return parsed.trim() || null;
  }

  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const data = parsed as Record<string, unknown>;

  // Direct string fields used by our functions / common APIs.
  const directFields = ['reply', 'response', 'message', 'text', 'answer', 'content', 'output'];
  for (const field of directFields) {
    const value = data[field];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  // OpenAI-style chat completion payload.
  if (Array.isArray(data.choices)) {
    const content = (data.choices[0] as { message?: { content?: unknown } } | undefined)
      ?.message?.content;
    if (typeof content === 'string' && content.trim()) {
      return content.trim();
    }
  }

  return null;
}

/**
 * Send a single message to the AI assistant and return its reply.
 * Falls back to a friendly offline message if the function is missing,
 * errors, or returns an empty/unrecognised body.
 */
export async function generateChatReply(message: string): Promise<string> {
  try {
    const execution = await functions.createExecution(
      CHAT_FUNCTION_ID,
      JSON.stringify({ message })
    );
    console.log('AI Function Execution Response:', execution);

    const statusCode = execution.responseStatusCode ?? 0;
    const failed = execution.status === 'failed' || (statusCode > 0 && statusCode >= 400);

    if (!failed) {
      const reply = parseChatResponse(execution.responseBody);
      if (reply) {
        return reply;
      }
      console.warn(
        '[chat-ai] Empty or unrecognised response body:',
        execution.responseBody
      );
    } else {
      console.warn(
        '[chat-ai] Execution failed:',
        { status: execution.status, statusCode, body: execution.responseBody }
      );
    }
  } catch (error) {
    // Function not deployed / network / permission error.
    console.error('AI Function Error:', error);
  }

  return fallbackReply(message);
}
