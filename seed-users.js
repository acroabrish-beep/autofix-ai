#!/usr/bin/env node
/**
 * seed-users.js
 *
 * Creates one test user for each SaaS role and links them to demo
 * institution/garage records. Safe to re-run: existing users and profiles
 * are updated instead of duplicated.
 *
 * Required environment variable:
 *   APPWRITE_API_KEY    server API key (scopes: users.write, databases.read, databases.write)
 *
 * Run:
 *   npm run seed:users
 * or:
 *   node --env-file=.env seed-users.js
 */

import { Client, Users, Databases, ID, Permission, Role, Query } from 'node-appwrite';

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

async function getOrCreateUser(email, name) {
  const existingUsers = await users.list([Query.equal('email', email)]);
  let user = existingUsers.users[0];

  if (!user) {
    user = await users.create(ID.unique(), email, undefined, password, name);
    console.log(`  created auth user: ${email}`);
  } else {
    console.log(`  auth user already exists: ${email}`);
  }

  // Appwrite blocks unverified users by default. Mark the seeded account as
  // verified and enabled so it can log in immediately.
  await users.updateEmailVerification(user.$id, true);
  await users.updateStatus(user.$id, true);
  await users.updatePassword(user.$id, password);

  return user;
}

async function upsertProfile(userId, data) {
  const permissions = [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
  ];

  const payload = {
    userId,
    avatarFileId: '',
    preferredLanguage: 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...data,
  };

  const existing = await databases.listDocuments(databaseId, 'profiles', [
    Query.equal('userId', userId),
  ]);

  if (existing.documents.length > 0) {
    await databases.updateDocument(databaseId, 'profiles', existing.documents[0].$id, payload);
    console.log(`  updated profile: ${data.email}`);
    return existing.documents[0];
  }

  const profile = await databases.createDocument(databaseId, 'profiles', ID.unique(), payload, permissions);
  console.log(`  created profile: ${data.email}`);
  return profile;
}

async function findProfileByEmail(email) {
  const result = await databases.listDocuments(databaseId, 'profiles', [Query.equal('email', email)]);
  return result.documents[0] || null;
}

async function main() {
  console.log('\nAutoFix AI — seed test users');
  console.log(`  Endpoint:  ${endpoint}`);
  console.log(`  Project:   ${projectId}`);
  console.log(`  Database:  ${databaseId}\n`);

  let school;
  const existingSchools = await databases.listDocuments(databaseId, 'schools', [
    Query.equal('name', 'Demo TVET School'),
  ]);
  if (existingSchools.documents.length > 0) {
    school = existingSchools.documents[0];
    console.log('  school already exists: Demo TVET School');
  } else {
    school = await databases.createDocument(
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
    console.log('  created school: Demo TVET School');
  }

  let garage;
  const existingGarages = await databases.listDocuments(databaseId, 'garages', [
    Query.equal('name', 'Demo Garage'),
  ]);
  if (existingGarages.documents.length > 0) {
    garage = existingGarages.documents[0];
    console.log('  garage already exists: Demo Garage');
  } else {
    garage = await databases.createDocument(
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
    console.log('  created garage: Demo Garage');
  }

  const accounts = [
    { email: 'globaladmin@autofix.ai', name: 'Global Admin', role: 'global_admin' },
    { email: 'tvetadmin@autofix.ai', name: 'TVET Admin', role: 'tvet_admin', institutionId: school.$id },
    { email: 'instructor@autofix.ai', name: 'Demo Instructor', role: 'instructor', institutionId: school.$id },
    { email: 'student@autofix.ai', name: 'Demo Student', role: 'student', institutionId: school.$id },
    { email: 'garageadmin@autofix.ai', name: 'Garage Admin', role: 'garage_admin', garageId: garage.$id },
    { email: 'mechanic@autofix.ai', name: 'Demo Mechanic', role: 'mechanic', garageId: garage.$id },
  ];

  for (const account of accounts) {
    const authUser = await getOrCreateUser(account.email, account.name);
    await upsertProfile(authUser.$id, {
      fullName: account.name,
      email: account.email,
      role: account.role,
      institutionId: account.institutionId || '',
      garageId: account.garageId || '',
    });

    console.log(`✓ ${account.role}: ${account.email}`);
  }

  const tvetAdminProfile = await findProfileByEmail('tvetadmin@autofix.ai');
  if (tvetAdminProfile) {
    await databases.updateDocument(databaseId, 'schools', school.$id, {
      adminId: tvetAdminProfile.userId,
    });
  }

  const garageAdminProfile = await findProfileByEmail('garageadmin@autofix.ai');
  if (garageAdminProfile) {
    await databases.updateDocument(databaseId, 'garages', garage.$id, {
      ownerId: garageAdminProfile.userId,
    });
  }

  console.log('\nAll test users are ready.');
  console.log(`Shared password: ${password}\n`);
}

main().catch((error) => {
  console.error('\nSeed failed:', error?.message || error);
  process.exitCode = 1;
});
