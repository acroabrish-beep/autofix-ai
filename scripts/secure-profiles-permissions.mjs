import { setTimeout as delay } from 'node:timers/promises';

const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const databaseId = process.env.APPWRITE_DATABASE_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const apply = process.argv.includes('--apply');

if (![endpoint, projectId, databaseId, apiKey].every(Boolean)) {
  throw new Error('Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_DATABASE_ID and APPWRITE_API_KEY in the environment.');
}

async function call(path, options = {}) {
  const response = await fetch(`${endpoint}${path}`, {
    ...options,
    headers: {
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  let data = null;
  if (raw) { try { data = JSON.parse(raw); } catch { data = { message: raw }; } }
  if (!response.ok) throw new Error(data?.message || `Appwrite API failed (${response.status})`);
  return data;
}

const collectionPath = `/databases/${databaseId}/collections/profiles`;
const collection = await call(collectionPath);
const nextCollectionPermissions = (collection.$permissions || []).filter((permission) => !permission.startsWith('create('));

let cursor = null;
let scanned = 0;
let changed = 0;
do {
  const params = new URLSearchParams({ limit: '100' });
  if (cursor) params.set('cursorAfter', cursor);
  const page = await call(`${collectionPath}/documents?${params.toString()}`);
  const documents = page.documents || [];
  scanned += documents.length;

  for (const document of documents) {
    const current = document.$permissions || [];
    const readOnly = current.filter((permission) => /^read\\(\"user:[^\"]+\"\\)$/.test(permission));
    if (document.userId && !readOnly.includes(`read("user:${document.userId}")`)) {
      readOnly.push(`read("user:${document.userId}")`);
    }
    const changedPermissions = JSON.stringify([...current].sort()) !== JSON.stringify([...readOnly].sort());
    if (!changedPermissions) continue;
    changed += 1;
    if (apply) {
      await call(`${collectionPath}/documents/${encodeURIComponent(document.$id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ data: {}, permissions: readOnly }),
      });
      await delay(40);
    }
  }
  cursor = documents.length === 100 ? documents[documents.length - 1].$id : null;
} while (cursor);

const collectionPermissionChanged =
  JSON.stringify([...(collection.$permissions || [])].sort()) !== JSON.stringify([...nextCollectionPermissions].sort());

console.log(JSON.stringify({
  mode: apply ? 'APPLY' : 'DRY_RUN',
  collectionCreatePermissionsToRemove: collectionPermissionChanged,
  profilesScanned: scanned,
  profileDocumentsWithWritePermissionsToRemove: changed,
  note: apply
    ? 'Profile document write permissions were removed and collection-level create permissions were removed.'
    : 'No changes made. Re-run with --apply only after the Function and coordinated frontend release are ready.',
}, null, 2));

if (apply && collectionPermissionChanged) {
  await call(collectionPath, {
    method: 'PUT',
    body: JSON.stringify({
      name: collection.name,
      permissions: nextCollectionPermissions,
      documentSecurity: collection.documentSecurity,
    }),
  });
  console.log('Collection-level create permissions removed.');
}
