#!/usr/bin/env node
/**
 * seed-learning.js
 *
 * Inserts six learning modules into the `learning_modules` collection in
 * the `autofix-ai-db` database.
 *
 * Safe to re-run: deterministic document IDs are used, so existing seed
 * documents are updated instead of duplicated.
 *
 * Required environment variable:
 *   APPWRITE_API_KEY    server API key (scopes: databases.read, databases.write)
 *
 * Optional:
 *   APPWRITE_ENDPOINT   default: https://fra.cloud.appwrite.io/v1
 *   APPWRITE_PROJECT_ID
 *   APPWRITE_DATABASE_ID default: autofix-ai-db
 *
 * Run:
 *   npm run seed:learning
 * or:
 *   node --env-file=.env seed-learning.js
 */

import { Client, Databases } from 'node-appwrite';

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

const COLLECTION_ID = 'learning_modules';

/**
 * Categories below match the frontend CategoryFilter exactly, so the
 * category chips will find these modules.
 */
const MODULES = [
  {
    id: 'engine-basics',
    data: {
      title: 'Engine Basics',
      description:
        'Understand how internal combustion engines work: the four-stroke cycle, major components, lubrication, cooling, and the routine checks that keep an engine healthy.',
      category: 'Engine Systems',
      duration: '45 min',
      level: 'beginner',
      content:
        'A four-stroke engine completes intake, compression, power, and exhaust in a repeating cycle. The crankshaft converts the pistons’ motion into rotation, while the valve train controls the movement of air and exhaust gases.\n\n' +
        'Lubrication reduces friction between moving parts, and the cooling system carries excess heat away from the engine. A change in oil level, coolant temperature, exhaust color, or engine noise can provide useful evidence during an inspection.\n\n' +
        'Begin with the vehicle history and a visual inspection, then compare measurements with the manufacturer’s service data. Keep hands and tools clear of belts, fans, hot surfaces, and other moving components.',
    },
  },
  {
    id: 'electrical-systems-101',
    data: {
      title: 'Electrical Systems 101',
      description:
        'Learn the fundamentals of automotive electrical systems, including batteries, alternators, starting circuits, fuses, relays, and safe multimeter testing procedures.',
      category: 'Electrical Systems',
      duration: '60 min',
      level: 'beginner',
      content:
        'A vehicle electrical system stores energy in the battery and uses circuits to start the engine, charge the battery, and power accessories. Voltage describes electrical potential, current describes flow, and resistance describes opposition to that flow.\n\n' +
        'A multimeter helps test these conditions, but the measurement must be made at the correct points and under the right load. Check battery terminals, fuses, grounds, and wiring before assuming a component has failed. Voltage-drop testing can reveal resistance that a simple continuity check may miss.\n\n' +
        'Use insulated probes and follow the meter and vehicle instructions. Avoid shorting battery terminals, and disconnect power when the service procedure requires it.',
    },
  },
  {
    id: 'brake-diagnostics',
    data: {
      title: 'Brake Diagnostics',
      description:
        'Diagnose common braking problems such as squealing, grinding, pedal pulsation and fluid leaks. Covers pads, rotors, calipers, ABS basics and safety inspection.',
      category: 'Diagnostics',
      duration: '50 min',
      level: 'intermediate',
      content:
        'Braking force is created when pads press against rotors, with hydraulic pressure transferring pedal effort to the calipers. The tires then convert that friction into a controlled reduction in vehicle speed. Uneven wear, vibration, pulling, noise, or a changing pedal feel can point toward different faults.\n\n' +
        'Inspect both sides of the axle and measure pads and rotors against the vehicle’s service limits. Check for leaks, damaged hoses, seized hardware, and warning indicators before drawing a conclusion. A road test should only be performed when the vehicle is safe to operate.\n\n' +
        'Support the vehicle with correctly rated stands and never rely on a jack alone. Brake work is safety-critical; follow the service procedure and verify the repair before returning the vehicle to use.',
    },
  },
  {
    id: 'transmission-drivetrain',
    data: {
      title: 'Transmission & Drivetrain',
      description:
        'Explore manual and automatic transmissions, clutches, differentials and drivetrain layout. Learn symptom-based diagnosis and preventive maintenance.',
      category: 'Vehicle Maintenance',
      duration: '75 min',
      level: 'intermediate',
      content:
        'The transmission and drivetrain deliver engine torque to the wheels. A clutch or torque converter connects engine output to the transmission, while gearsets change the relationship between engine speed and wheel speed. Differentials allow driven wheels to rotate at different speeds when turning.\n\n' +
        'Delayed engagement, slipping, unusual noise, vibration, or fluid leaks should be documented with the conditions in which they occur. Check the correct fluid level and condition procedure, scan for relevant trouble codes, and inspect mounts and driveline components before recommending repairs.\n\n' +
        'Many components require specialized lifting and diagnostic equipment. Use vehicle-specific service data and do not work beneath an unsupported vehicle.',
    },
  },
  {
    id: 'hvac-climate-control',
    data: {
      title: 'HVAC & Climate Control',
      description:
        'Understand heating, ventilation and air-conditioning systems: refrigerant cycle, compressor, condenser, cabin filters and common performance faults.',
      category: 'Automotive Fundamentals',
      duration: '40 min',
      level: 'beginner',
      content:
        'Heating, ventilation, and air conditioning move and condition air inside the cabin. In cooling mode, refrigerant carries heat from the evaporator to the condenser; the compressor circulates it through the system while metering devices regulate flow.\n\n' +
        'Weak airflow may begin with a restricted cabin filter or blower issue, while warm air can have several causes including control, airflow, or refrigerant-system faults. Record vent temperature and operating conditions, and inspect accessible components before choosing a test.\n\n' +
        'Refrigerant systems operate under pressure and require approved recovery equipment. Do not vent refrigerant or open the system without the required training and tools.',
    },
  },
  {
    id: 'obd-ii-scan-tools',
    data: {
      title: 'OBD-II & Scan Tools',
      description:
        'Read and interpret OBD-II diagnostic trouble codes, use live data and freeze-frame information, and turn scan-tool results into a structured repair plan.',
      category: 'Electronics',
      duration: '55 min',
      level: 'advanced',
      content:
        'OBD-II scan tools communicate with vehicle control modules and report diagnostic trouble codes, freeze-frame snapshots, and live data. A code identifies a detected condition; it does not automatically identify a failed part.\n\n' +
        'Record all codes before clearing anything, note whether they are current or pending, and review freeze-frame data to understand when the fault occurred. Compare live readings with expected values and use a wiring diagram or service procedure to test the suspected circuit.\n\n' +
        'Confirm the repair by repeating the relevant test and checking monitor status. Preserve useful scan data for the service record, and follow safety instructions when working around moving or energized components.',
    },
  },
];

if (!projectId) {
  console.error(
    'Missing project ID. Set APPWRITE_PROJECT_ID (or VITE_APPWRITE_PROJECT_ID in .env).'
  );
  process.exit(1);
}

if (!apiKey) {
  console.error('Missing APPWRITE_API_KEY. Set it in your shell or in .env.');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function seedModule({ id, data }) {
  try {
    await databases.getDocument(databaseId, COLLECTION_ID, id);
    await databases.updateDocument(databaseId, COLLECTION_ID, id, data);
    console.log(`↻ updated  ${id}`);
  } catch (error) {
    if (error.code !== 404) throw error;
    await databases.createDocument(databaseId, COLLECTION_ID, id, data);
    console.log(`+ created  ${id}`);
  }
}

async function main() {
  console.log('\nAutoFix AI — seeding learning_modules');
  console.log(`  Endpoint:   ${endpoint}`);
  console.log(`  Project:    ${projectId}`);
  console.log(`  Database:   ${databaseId}`);
  console.log(`  Collection: ${COLLECTION_ID}\n`);

  for (const module of MODULES) {
    await seedModule(module);
  }

  console.log(`\nDone. ${MODULES.length} modules are available.\n`);
}

main().catch((error) => {
  console.error('\nSeeding failed:', error?.message || error);

  if (error?.code === 401) {
    console.error(
      'Authentication failed. Verify APPWRITE_API_KEY and its databases.read / databases.write scopes.'
    );
  } else if (error?.code === 404) {
    console.error(
      `Collection "${COLLECTION_ID}" (or database "${databaseId}") was not found. ` +
        'Run "npm run setup:db" first.'
    );
  } else if (error?.code === 400) {
    console.error(
      'Bad request. Make sure the collection has title, description, category, duration, level, and content attributes.'
    );
  }

  process.exitCode = 1;
});
