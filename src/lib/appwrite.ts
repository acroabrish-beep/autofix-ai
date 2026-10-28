import { Client, Account, Databases, Storage, ID } from 'appwrite';

/**
 * Single source of truth for the Appwrite SDK.
 *
 * Required environment variables (see `.env`):
 *   VITE_APPWRITE_ENDPOINT     e.g. https://fra.cloud.appwrite.io/v1
 *   VITE_APPWRITE_PROJECT_ID   your Appwrite project ID
 *   VITE_APPWRITE_DATABASE_ID  your Appwrite database ID
 */
const endpoint = (import.meta.env.VITE_APPWRITE_ENDPOINT as string | undefined)?.trim();
const projectId = (import.meta.env.VITE_APPWRITE_PROJECT_ID as string | undefined)?.trim();
const databaseId = (import.meta.env.VITE_APPWRITE_DATABASE_ID as string | undefined)?.trim();
const chatCollectionId = import.meta.env.VITE_APPWRITE_COLLECTION_ID as string | undefined;

if (!endpoint || !projectId || !databaseId) {
  // Warn instead of throwing so the landing page still renders during setup.
  console.warn(
    '[Appwrite] Missing configuration. Set VITE_APPWRITE_ENDPOINT, ' +
      'VITE_APPWRITE_PROJECT_ID and VITE_APPWRITE_DATABASE_ID in .env'
  );
}

/**
 * Runtime configuration log.
 *
 * Vite inlines `import.meta.env.*` at build time, so deployed values must be
 * present when Vercel builds the app. If these print as "(not set)" in the
 * browser console, the production environment variables are missing.
 */
console.log(`[Appwrite] Endpoint: ${endpoint ?? '(not set)'}`);
console.log(`[Appwrite] Project ID: ${projectId ?? '(not set)'}`);
console.log(`[Appwrite] Database ID: ${databaseId ?? '(not set)'}`);

export const client = new Client();

// Only override the SDK defaults when the values exist. Never fall back to a
// hardcoded URL/project — a missing config should be visible, not silent.
if (endpoint) {
  client.setEndpoint(endpoint);
}
if (projectId) {
  client.setProject(projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

/** Database ID from the environment, with a fallback for local development. */
export const DATABASE_ID = databaseId || 'autofix-ai-db';

/** Collection that stores AI chat exchanges. */
export const CHAT_COLLECTION_ID = chatCollectionId || 'chat_history';

export { ID };
