#!/usr/bin/env node
/**
 * setup-db.js
 *
 * Creates every collection AutoFix AI needs inside the target database,
 * including their attributes and permissions.
 *
 * Currently managed:
 *   - learning_modules  (public read)
 *   - chat_history      (Users CRUD)
 *   - repair_guides     (Users CRUD)
 *   - vehicles          (Users CRUD)
 *   - diagnostic_sessions (Users create; owner-only documents)
 *   - schools           (Shared read)
 *   - garages           (Shared read)
 *   - applications      (Users create; owner-only documents)
 *
 * Safe to re-run: existing collections, attributes and permissions are
 * detected and skipped or merged. Attribute creation is asynchronous in
 * Appwrite, so the script polls each attribute until it is available.
 *
 * Required environment variable:
 *   APPWRITE_API_KEY    server API key (scopes: databases.read, databases.write)
 *
 * Optional (falls back to the VITE_* values used by the web app):
 *   APPWRITE_ENDPOINT   default: https://fra.cloud.appwrite.io/v1
 *   APPWRITE_PROJECT_ID
 *   APPWRITE_DATABASE_ID default: autofix-ai-db
 *
 * Run:
 *   npm run setup:db
 * or:
 *   node --env-file=.env setup-db.js
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';

const endpoint =
  process.env.APPWRITE_ENDPOINT ||
  process.env.VITE_APPWRITE_ENDPOINT ||
  'https://fra.cloud.appwrite.io/v1';

const projectId =
  process.env.APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID;

const apiKey = process.env.APPWRITE_API_KEY;

const databaseId =
  process.env.APPWRITE_DATABASE_ID ||
  process.env.VITE_APPWRITE_DATABASE_ID ||
  'autofix-ai-db';

/**
 * Collection-level permissions.
 *
 * CREATE must stay at collection level — Appwrite checks it there. Read,
 * update and delete are delegated to each document's own permissions via
 * `documentSecurity: true`, so users only see their own rows.
 */
const USERS_CREATE = [Permission.create(Role.users())];

/** Shared read-only content (guides are written by admins/server only). */
const USERS_READ = [Permission.read(Role.users())];

const COLLECTIONS = [
  {
    id: 'learning_modules',
    name: 'Learning Modules',
    permissions: [Permission.read(Role.any()), Permission.update(Role.users())],
    documentSecurity: true,
    attributes: [
      { key: 'title', size: 255 },
      { key: 'description', size: 1000 },
      { key: 'programId', size: 255 },
      { key: 'translations', size: 10000 },
    ],
  },
  {
    id: 'chat_history',
    name: 'Chat History',
    // Users may create; each document grants read/update/delete to its owner.
    permissions: USERS_CREATE,
    documentSecurity: true,
    attributes: [
      { key: 'userId', size: 255 },
      { key: 'institutionId', size: 255 },
      { key: 'userMessage', size: 5000 },
      { key: 'aiResponse', size: 10000 },
    ],
  },
  {
    id: 'repair_guides',
    name: 'Repair Guides',
    // Shared library: all signed-in users can read, only server/admin writes.
    permissions: USERS_READ,
    documentSecurity: true,
    attributes: [
      { key: 'title', size: 255 },
      { key: 'description', size: 1000 },
      { key: 'category', size: 100 },
      { key: 'difficulty', size: 100 },
      // The frontend maps over this (guide.steps.map), so it is a string array.
      { key: 'steps', size: 5000, array: true },
      { key: 'safetyNotes', size: 5000 },
      { key: 'requiredTools', size: 100, array: true },
    ],
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    // Users may create; each document grants read/update/delete to its owner.
    permissions: USERS_CREATE,
    documentSecurity: true,
    attributes: [
      { key: 'userId', size: 255 },
      { key: 'institutionId', size: 255 },
      { key: 'make', size: 100 },
      { key: 'model', size: 100 },
      { key: 'year', size: 10 },
      { key: 'engine', size: 100 },
    ],
  },
  {
    id: 'diagnostic_sessions',
    name: 'Diagnostic Sessions',
    // Users may create; each document grants read/update/delete to its owner.
    permissions: USERS_CREATE,
    documentSecurity: true,
    attributes: [
      { key: 'userId', size: 255 },
      { key: 'institutionId', size: 255 },
      { key: 'vehicleId', size: 255 },
      { key: 'description', size: 5000 },
      { key: 'aiResponse', size: 10000 },
    ],
  },
  {
    id: 'schools',
    name: 'Schools',
    // Shared directory: signed-in users can read; owners/admins write at document level.
    permissions: USERS_READ,
    documentSecurity: true,
    attributes: [
      { key: 'name', size: 255 },
      { key: 'location', size: 255 },
      { key: 'adminId', size: 255 },
      { key: 'status', size: 50 },
    ],
  },
  {
    id: 'garages',
    name: 'Garages',
    // Shared directory: signed-in users can read; owners/admins write at document level.
    permissions: USERS_READ,
    documentSecurity: true,
    attributes: [
      { key: 'name', size: 255 },
      { key: 'location', size: 255 },
      { key: 'ownerId', size: 255 },
      { key: 'status', size: 50 },
    ],
  },
  {
    id: 'applications',
    name: 'Applications',
    // Users may create; each document grants read/update/delete to its owner.
    permissions: USERS_CREATE,
    documentSecurity: true,
    attributes: [
      { key: 'type', size: 50 },
      { key: 'applicantId', size: 255 },
      { key: 'details', size: 1000 },
      { key: 'status', size: 50 },
    ],
  },
  {
    id: 'profiles',
    name: 'Profiles',
    // Users may create their own profile; each document grants read/update to its owner.
    permissions: USERS_CREATE,
    documentSecurity: true,
    attributes: [
      { key: 'userId', size: 255 },
      { key: 'fullName', size: 255 },
      { key: 'email', size: 255 },
      { key: 'role', size: 50 },
      { key: 'avatarUrl', size: 500 },
      { key: 'avatarFileId', size: 255 },
      { key: 'preferredLanguage', size: 50 },
      { key: 'institutionId', size: 255 },
      { key: 'garageId', size: 255 },
      { key: 'phone', size: 50 },
      { key: 'specialization', size: 255 },
      { key: 'status', size: 50 },
      { key: 'createdAt', size: 50 },
      { key: 'updatedAt', size: 50 },
    ],
  },
  {
    id: 'assignments',
    name: 'Assignments',
    // Instructors create assignments; students and instructors can read them.
    permissions: USERS_CREATE,
    documentSecurity: true,
    attributes: [
      { key: 'title', size: 255 },
      { key: 'description', size: 1000 },
      { key: 'courseId', size: 255 },
      { key: 'instructorId', size: 255 },
      { key: 'institutionId', size: 255 },
      { key: 'dueDate', size: 255 },
    ],
  },
  {
    id: 'service_requests',
    name: 'Service Requests',
    // Users may create; garage staff and owners update at document level.
    permissions: USERS_CREATE,
    documentSecurity: true,
    attributes: [
      { key: 'title', size: 255 },
      { key: 'description', size: 1000 },
      { key: 'vehicleId', size: 255 },
      { key: 'garageId', size: 255 },
      { key: 'status', size: 50 },
      { key: 'assignedMechanicId', size: 255 },
      { key: 'finalCost', size: 50 },
      { key: 'notes', size: 2000 },
      { key: 'createdAt', size: 50 },
    ],
  },
  {
    id: 'learning_progress',
    name: 'Learning Progress',
    // Users may create their own progress; each document grants read/update to its owner.
    permissions: USERS_CREATE,
    documentSecurity: true,
    attributes: [
      { key: 'userId', size: 255 },
      { key: 'moduleId', size: 255 },
      { key: 'progressPercent', type: 'integer' },
      { key: 'completed', type: 'boolean' },
      { key: 'startedAt', size: 255 },
    ],
  },
  {
    id: 'audit_logs',
    name: 'Audit Logs',
    // Admin actions are logged here; admins can create and read entries.
    permissions: [Permission.create(Role.users()), Permission.read(Role.users())],
    documentSecurity: true,
    attributes: [
      { key: 'actorId', size: 255 },
      { key: 'action', size: 255 },
      { key: 'targetId', size: 255 },
      { key: 'details', size: 1000 },
      { key: 'timestamp', size: 255 },
    ],
  },
  {
    id: 'departments',
    name: 'Departments',
    permissions: [Permission.create(Role.users()), Permission.read(Role.users()), Permission.update(Role.users())],
    documentSecurity: true,
    attributes: [
      { key: 'name', size: 255 },
      { key: 'institutionId', size: 255 },
      { key: 'headId', size: 255 },
    ],
  },
  {
    id: 'programs',
    name: 'Programs',
    permissions: [Permission.create(Role.users()), Permission.read(Role.users()), Permission.update(Role.users())],
    documentSecurity: true,
    attributes: [
      { key: 'name', size: 255 },
      { key: 'departmentId', size: 255 },
      { key: 'institutionId', size: 255 },
      { key: 'level', size: 50 },
    ],
  },
  {
    id: 'submissions',
    name: 'Submissions',
    permissions: [Permission.create(Role.users()), Permission.read(Role.users()), Permission.update(Role.users())],
    documentSecurity: true,
    attributes: [
      { key: 'assignmentId', size: 255 },
      { key: 'studentId', size: 255 },
      { key: 'studentName', size: 255 },
      { key: 'content', size: 2000 },
      { key: 'status', size: 50 },
      { key: 'grade', size: 50 },
      { key: 'feedback', size: 1000 },
      { key: 'submittedAt', size: 255 },
    ],
  },
  {
    id: 'certificates',
    name: 'Certificates',
    permissions: [Permission.create(Role.users()), Permission.read(Role.users())],
    documentSecurity: true,
    attributes: [
      { key: 'studentId', size: 255 },
      { key: 'studentName', size: 255 },
      { key: 'courseId', size: 255 },
      { key: 'courseName', size: 255 },
      { key: 'issueDate', size: 255 },
      { key: 'certificateUrl', size: 255 },
    ],
  },
  {
    id: 'payments',
    name: 'Payments',
    permissions: [Permission.create(Role.users()), Permission.read(Role.users())],
    documentSecurity: true,
    attributes: [
      { key: 'institutionId', size: 255 },
      { key: 'amount', size: 50 },
      { key: 'date', size: 50 },
      { key: 'status', size: 50 },
    ],
  },
  {
    id: 'service_records',
    name: 'Service Records',
    permissions: USERS_CREATE,
    documentSecurity: true,
    attributes: [
      { key: 'vehicleId', size: 255 },
      { key: 'garageId', size: 255 },
      { key: 'mechanicId', size: 255 },
      { key: 'description', size: 1000 },
      { key: 'date', size: 255 },
      { key: 'cost', size: 50 },
    ],
  },
];
// Set to true if every document must provide each attribute.
const ATTRIBUTES_REQUIRED = false;

if (!projectId) {
  console.error(
    'Missing project ID. Set APPWRITE_PROJECT_ID (or VITE_APPWRITE_PROJECT_ID in .env).'
  );
  process.exit(1);
}

if (!apiKey) {
  console.error(
    'Missing APPWRITE_API_KEY. Create a server API key with "databases.read" and ' +
      '"databases.write" scopes, then expose it as an environment variable.'
  );
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Attribute creation is asynchronous in Appwrite. Poll until the attribute
 * can accept data before moving on.
 */
async function waitForAttribute(collectionId, key, timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const attribute = await databases.getAttribute(databaseId, collectionId, key);

    if (attribute.status === 'available') return;
    if (attribute.status === 'failed') {
      throw new Error(
        `Attribute "${key}" failed to build. Check the Appwrite console for details.`
      );
    }

    console.log(`      waiting for "${key}" (${attribute.status})...`);
    await sleep(1000);
  }

  throw new Error(`Timed out waiting for attribute "${key}".`);
}

function permissionsEqual(a, b) {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((permission) => set.has(permission));
}

/**
 * Applies the exact permission set and document-security flag.
 *
 * Uses exact replacement (not merge) so previously granted collection-wide
 * read/update/delete permissions are removed when tightening security.
 */
async function reconcileCollection(collection, desiredPermissions, desiredDocumentSecurity) {
  const current = collection.$permissions ?? [];
  const permissionsMatch = permissionsEqual(current, desiredPermissions);
  const securityMatches = collection.documentSecurity === desiredDocumentSecurity;

  if (permissionsMatch && securityMatches) {
    console.log(
      `      permissions OK (documentSecurity=${desiredDocumentSecurity}).`
    );
    return;
  }

  await databases.updateCollection(
    databaseId,
    collection.$id,
    collection.name,
    desiredPermissions,
    desiredDocumentSecurity,
    collection.enabled
  );

  console.log(
    `      updated → documentSecurity=${desiredDocumentSecurity}, ` +
      `permissions=[${desiredPermissions.join(', ') || 'none'}]`
  );
}

async function ensureCollection({ id, name, permissions, documentSecurity }) {
  try {
    const collection = await databases.getCollection(databaseId, id);
    console.log(`✓ Collection "${id}" already exists.`);
    await reconcileCollection(collection, permissions, documentSecurity);
    return collection;
  } catch (error) {
    if (error.code !== 404) throw error;

    console.log(`+ Creating collection "${id}"...`);
    const collection = await databases.createCollection(
      databaseId,
      id,
      name,
      permissions,
      documentSecurity,
      true // enabled
    );
    console.log(
      `      created (documentSecurity=${documentSecurity}).`
    );
    return collection;
  }
}

async function ensureAttribute(collectionId, { key, size, array, type }) {
  const attributeType =
    type === 'integer' ? 'integer' : type === 'boolean' ? 'boolean' : array ? 'string array' : 'string';

  try {
    const existing = await databases.getAttribute(databaseId, collectionId, key);

    if (existing.status === 'available') {
      console.log(`  ✓ ${key} (${attributeType}${size ? `, ${size}` : ''}) already exists.`);
    } else {
      console.log(`  … ${key} exists (status: ${existing.status}), waiting...`);
      await waitForAttribute(collectionId, key);
    }
    return;
  } catch (error) {
    if (error.code !== 404) throw error;
  }

  console.log(`  + ${key} (${attributeType}${size ? `, ${size}` : ''})`);

  if (type === 'integer') {
    await databases.createIntegerAttribute(
      databaseId,
      collectionId,
      key,
      ATTRIBUTES_REQUIRED,
      0,
      100,
      null,
      false
    );
  } else if (type === 'boolean') {
    await databases.createBooleanAttribute(
      databaseId,
      collectionId,
      key,
      ATTRIBUTES_REQUIRED,
      null,
      false
    );
  } else if (array) {
    // Array attributes cannot have a default value.
    await databases.createStringAttribute(
      databaseId,
      collectionId,
      key,
      size,
      ATTRIBUTES_REQUIRED,
      null,
      true
    );
  } else {
    await databases.createStringAttribute(
      databaseId,
      collectionId,
      key,
      size,
      ATTRIBUTES_REQUIRED
    );
  }

  await waitForAttribute(collectionId, key);
  console.log(`      ${key} is available.`);
}

async function main() {
  console.log('\nAutoFix AI — Appwrite database setup');
  console.log(`  Endpoint:    ${endpoint}`);
  console.log(`  Project:     ${projectId}`);
  console.log(`  Database:    ${databaseId}`);
  console.log(`  Collections: ${COLLECTIONS.map((collection) => collection.id).join(', ')}\n`);

  for (const collection of COLLECTIONS) {
    console.log(`\n─── ${collection.id} ───`);
    await ensureCollection(collection);

    console.log('  Attributes:');
    for (const attribute of collection.attributes) {
      await ensureAttribute(collection.id, attribute);
    }
  }

  console.log('\nDone. All collections are ready.\n');
}

main().catch((error) => {
  console.error('\nSetup failed:', error?.message || error);

  if (error?.code === 401) {
    console.error(
      'Authentication failed. Verify APPWRITE_API_KEY belongs to this project and ' +
        'has the "databases.read" and "databases.write" scopes.'
    );
  } else if (error?.code === 404) {
    console.error(
      `Database "${databaseId}" was not found. Create it in the Appwrite console or ` +
        'set APPWRITE_DATABASE_ID to the correct ID.'
    );
  }

  process.exitCode = 1;
});
