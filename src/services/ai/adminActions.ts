import { client } from '../../lib/appwrite/client';
import { Functions } from 'appwrite';

const functions = new Functions(client);

const ADMIN_FUNCTION_ID =
  (import.meta.env.VITE_APPWRITE_ADMIN_FUNCTION_ID as string | undefined)?.trim() ||
  '6a7743a8001a7c995501';

export async function runAdminAction(action: string, payload: Record<string, any> = {}) {
  if (!ADMIN_FUNCTION_ID) {
    throw new Error('Admin actions function is not configured.');
  }

  const execution = await functions.createExecution(
    ADMIN_FUNCTION_ID,
    JSON.stringify({ action, payload })
  );

  const statusCode = execution.responseStatusCode ?? 0;

  const parseBody = () => {
    if (!execution.responseBody) return null;
    try {
      return JSON.parse(execution.responseBody);
    } catch {
      return null;
    }
  };

  const parsedBody = parseBody();

  if (execution.status === 'failed' || statusCode >= 400) {
    throw new Error(parsedBody?.error || execution.responseBody || 'Admin action failed.');
  }

  if (!execution.responseBody) {
    return null;
  }

  if (parsedBody?.error) {
    throw new Error(parsedBody.error);
  }

  return parsedBody;
}
