/**
 * Verify the Appwrite-injected execution JWT and return the authenticated account.
 * Never use x-appwrite-user-id or a body-supplied actorId as proof of identity.
 */
export async function getAuthenticatedAccount({ headers }, {
  endpoint = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1',
  projectId = process.env.APPWRITE_PROJECT_ID,
  fetchImpl = fetch,
} = {}) {
  const jwt = headers?.['x-appwrite-user-jwt'];
  if (typeof jwt !== 'string' || !jwt.trim() || !projectId) return null;

  const response = await fetchImpl(`${endpoint}/account`, {
    method: 'GET',
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-JWT': jwt,
      Accept: 'application/json',
    },
  });

  if (!response.ok) return null;
  const account = await response.json();
  return account?.$id ? account : null;
}
