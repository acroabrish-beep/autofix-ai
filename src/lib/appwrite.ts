import { Client, Account, Databases, Storage, ID } from 'appwrite';

/**
 * Single source of truth for the Appwrite SDK.
 *
 * Required environment variables (see `.env`):
 *   VITE_APPWRITE_ENDPOINT     e.g. https://fra.cloud.appwrite.io/v1
 *   VITE_APPWRITE_PROJECT_ID   your Appwrite project ID
 *   VITE_APPWRITE_DATABASE_ID  your Appwrite database ID
 */
const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT as string | undefined;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID as string | undefined;
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID as string | undefined;
const chatCollectionId = import.meta.env.VITE_APPWRITE_COLLECTION_ID as string | undefined;

if (!endpoint || !projectId || !databaseId) {
  // Warn instead of throwing so the landing page still renders during setup.
  console.warn(
    '[Appwrite] Missing configuration. Set VITE_APPWRITE_ENDPOINT, ' +
      'VITE_APPWRITE_PROJECT_ID and VITE_APPWRITE_DATABASE_ID in .env'
  );
}

export const client = new Client()
  .setEndpoint(endpoint || 'https://placeholder.appwrite.io/v1')
  .setProject(projectId || 'placeholder');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

/** Database ID from the environment, with a fallback for local development. */
export const DATABASE_ID = databaseId || 'autofix-ai-db';

/** Collection that stores AI chat exchanges. */
export const CHAT_COLLECTION_ID = chatCollectionId || 'chat_history';

export { ID };
