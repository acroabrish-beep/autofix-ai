#!/usr/bin/env node
/**
 * seed-data.js
 *
 * Seeds relational demo data for the AutoFix AI dashboards.
 *
 * Required environment variable:
 *   APPWRITE_API_KEY    server API key (scopes: databases.read, databases.write)
 *
 * Run:
 *   npm run seed:data
 * or:
 *   node --env-file=.env seed-data.js
 */

import { Client, Databases, ID, Permission, Role, Query } from 'node-appwrite';

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

if (!projectId) {
  console.error('Missing project ID. Set APPWRITE_PROJECT_ID (or VITE_APPWRITE_PROJECT_ID in .env).');
  process.exit(1);
}

if (!apiKey) {
  console.error('Missing APPWRITE_API_KEY.');
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

async function firstDocument(collectionId, queries = []) {
  const result = await databases.listDocuments(databaseId, collectionId, queries);
  return result.documents[0] || null;
}

async function findProfileByEmail(email) {
  const result = await databases.listDocuments(databaseId, 'profiles', [Query.equal('email', email)]);
  return result.documents[0] || null;
}

async function main() {
  console.log('\nAutoFix AI — seed relational demo data');
  console.log(`  Endpoint:  ${endpoint}`);
  console.log(`  Project:   ${projectId}`);
  console.log(`  Database:  ${databaseId}\n`);

  const garage = await firstDocument('garages');
  if (!garage) {
    throw new Error('No garage found. Run npm run setup:db and npm run seed:users first.');
  }

  const course = await firstDocument('learning_modules');
  if (!course) {
    throw new Error('No learning module found. Seed learning content first.');
  }

  const studentProfile = await findProfileByEmail('student@autofix.ai');
  if (!studentProfile) {
    throw new Error('Student profile not found. Run npm run seed:users first.');
  }

  const instructorProfile = await findProfileByEmail('instructor@autofix.ai');

  // 1. Service request
  const existingRequest = await databases.listDocuments(databaseId, 'service_requests', [
    Query.equal('title', 'Brake Pad Replacement'),
  ]);
  if (existingRequest.documents.length === 0) {
    await databases.createDocument(
      databaseId,
      'service_requests',
      ID.unique(),
      {
        title: 'Brake Pad Replacement',
        description: 'Squeaking noise when braking.',
        vehicleId: '',
        garageId: garage.$id,
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      [Permission.read(Role.users())]
    );
    console.log('✓ Created service request: Brake Pad Replacement');
  } else {
    console.log('• Service request already exists: Brake Pad Replacement');
  }

  // 2. Learning progress
  const existingProgress = await databases.listDocuments(databaseId, 'learning_progress', [
    Query.equal('studentId', studentProfile.userId),
    Query.equal('courseId', course.$id),
  ]);
  if (existingProgress.documents.length === 0) {
    await databases.createDocument(
      databaseId,
      'learning_progress',
      ID.unique(),
      {
        studentId: studentProfile.userId,
        courseId: course.$id,
        progressPercentage: 45,
        status: 'in_progress',
      },
      [
        Permission.read(Role.user(studentProfile.userId)),
        Permission.update(Role.user(studentProfile.userId)),
      ]
    );
    console.log('✓ Created learning progress for demo student');
  } else {
    console.log('• Learning progress already exists for demo student');
  }

  // 3. Assignment
  if (instructorProfile) {
    const existingAssignment = await databases.listDocuments(databaseId, 'assignments', [
      Query.equal('title', 'Brake System Quiz'),
    ]);
    if (existingAssignment.documents.length === 0) {
      await databases.createDocument(
        databaseId,
        'assignments',
        ID.unique(),
        {
          title: 'Brake System Quiz',
          description: 'Short quiz covering brake pad inspection and replacement.',
          courseId: course.$id,
          instructorId: instructorProfile.userId,
          institutionId: studentProfile.institutionId || '',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        [Permission.read(Role.users())]
      );
      console.log('✓ Created assignment: Brake System Quiz');
    } else {
      console.log('• Assignment already exists: Brake System Quiz');
    }
  } else {
    console.log('• Instructor profile not found; skipped assignment creation');
  }

  console.log('\nDemo relational data is ready.\n');
}

main().catch((error) => {
  console.error('\nSeed data failed:', error?.message || error);
  process.exitCode = 1;
});
