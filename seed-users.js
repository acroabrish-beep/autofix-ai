#!/usr/bin/env node
/**
 * seed-users.js
 *
 * Creates one test user for each SaaS role and links them to demo
 * institution/garage records. Run after `npm run setup:db`.
 *
 * Required environment variable:
 *   APPWRITE_API_KEY    server API key (scopes: users.write, databases.read, databases.write)
 *
 * Run:
 *   npm run seed:users
 * or:
 *   node --env-file=.env seed-users.js
 */

import { Client, Users, Databases, ID, Permission, Role } from 'node-appwrite';

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

const password = 'Password123!';

if (!projectId) {
  console.error('Missing project ID. Set APPWRITE_PROJECT_ID (or VITE_APPWRITE_PROJECT_ID in .env).');
  process.exit(1);
}

if (!apiKey) {
  console.error('Missing APPWRITE_API_KEY.');
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const users = new Users(client);
const databases = new Databases(client);

async function createAuthUser(email, name) {
  return await users.create(ID.unique(), email, undefined, password, name);
}

async function createProfile(userId, data) {
  const permissions = [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
  ];

  return await databases.createDocument(
    databaseId,
    'profiles',
    ID.unique(),
    {
      userId,
      avatarFileId: '',
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    },
    permissions
  );
}

async function main() {
  console.log('\nAutoFix AI — seed test users');
  console.log(`  Endpoint:  ${endpoint}`);
  console.log(`  Project:   ${projectId}`);
  console.log(`  Database:  ${databaseId}\n`);

  const school = await databases.createDocument(
    databaseId,
    'schools',
    ID.unique(),
    {
      name: 'Demo TVET School',
      location: 'Addis Ababa',
      adminId: '',
      status: 'active',
    },
    [Permission.read(Role.users())]
  );

  const garage = await databases.createDocument(
    databaseId,
    'garages',
    ID.unique(),
    {
      name: 'Demo Garage',
      location: 'Addis Ababa',
      ownerId: '',
      status: 'active',
    },
    [Permission.read(Role.users())]
  );

  const accounts = [
    {
      email: 'globaladmin@autofix.ai',
      name: 'Global Admin',
      role: 'global_admin',
    },
    {
      email: 'tvetadmin@autofix.ai',
      name: 'TVET Admin',
      role: 'tvet_admin',
      institutionId: school.$id,
    },
    {
      email: 'instructor@autofix.ai',
      name: 'Demo Instructor',
      role: 'instructor',
      institutionId: school.$id,
    },
    {
      email: 'student@autofix.ai',
      name: 'Demo Student',
      role: 'student',
      institutionId: school.$id,
    },
    {
      email: 'garageadmin@autofix.ai',
      name: 'Garage Admin',
      role: 'garage_admin',
      garageId: garage.$id,
    },
    {
      email: 'mechanic@autofix.ai',
      name: 'Demo Mechanic',
      role: 'mechanic',
      garageId: garage.$id,
    },
  ];

  for (const account of accounts) {
    const authUser = await createAuthUser(account.email, account.name);
    await createProfile(authUser.$id, {
      fullName: account.name,
      email: account.email,
      role: account.role,
      institutionId: account.institutionId || '',
      garageId: account.garageId || '',
    });

    console.log(`✓ ${account.role}: ${account.email}`);
  }

  await databases.updateDocument(databaseId, 'schools', school.$id, {
    adminId: (await databases.listDocuments(databaseId, 'profiles', [])).documents.find(
      (profile) => profile.email === 'tvetadmin@autofix.ai'
    ).userId,
  });

  await databases.updateDocument(databaseId, 'garages', garage.$id, {
    ownerId: (await databases.listDocuments(databaseId, 'profiles', [])).documents.find(
      (profile) => profile.email === 'garageadmin@autofix.ai'
    ).userId,
  });

  console.log('\nAll test users created.');
  console.log(`Shared password: ${password}\n`);
}

main().catch((error) => {
  console.error('\nSeed failed:', error?.message || error);
  process.exitCode = 1;
});
