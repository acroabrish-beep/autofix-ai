/**
 * Backwards-compatible shim.
 *
 * All Appwrite SDK setup now lives in `src/lib/appwrite.ts` so there is a
 * single `Client` instance (and a single `DATABASE_ID` source of truth).
 * Existing imports from `../../lib/appwrite/client` keep working.
 */
export { client, account, databases, storage, DATABASE_ID, ID } from '../appwrite';
