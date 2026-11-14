import { functions } from '../lib/appwrite';

const STAFF_INVITATIONS_FUNCTION_ID =
  (import.meta.env.VITE_APPWRITE_STAFF_INVITATIONS_FUNCTION_ID as string | undefined)?.trim() ||
  'staff-invitations';

export async function runStaffFunction<T>(
  action: 'bootstrap_student' | 'invite_staff' | 'list_staff' | 'list_tenant_profiles' | 'list_global_profiles' | 'update_self_profile',
  payload?: unknown
): Promise<T> {
  const execution = await functions.createExecution({
    functionId: STAFF_INVITATIONS_FUNCTION_ID,
    body: JSON.stringify({ action, ...(payload === undefined ? {} : { payload }) }),
    async: false,
    path: '/',
    method: 'POST',
    headers: { 'content-type': 'application/json' },
  });
  let response: { success?: boolean; data?: T; error?: string } = {};
  try { response = execution.responseBody ? JSON.parse(execution.responseBody) : {}; }
  catch { throw new Error('The staff service returned an unreadable response.'); }
  if (execution.responseStatusCode < 200 || execution.responseStatusCode >= 300 || !response.success) {
    throw new Error(response.error || 'The staff service request failed.');
  }
  return response.data as T;
}
