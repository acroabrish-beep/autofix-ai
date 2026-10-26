import { RepairGuide } from '../types';

/**
 * Offline / demo repair guides.
 *
 * Used by the Repairs library when the `repair_guides` collection is empty or
 * unavailable, and by the detail page when a `demo-*` id is opened.
 */
export const MOCK_REPAIR_GUIDES: RepairGuide[] = [
  {
    $id: 'demo-battery-voltage-check',
    $sequence: '0',
    $collectionId: 'demo',
    $databaseId: 'demo',
    $createdAt: '',
    $updatedAt: '',
    $permissions: [],
    title: 'Check Battery Voltage',
    description: 'Use a multimeter to assess battery state of charge and identify common starting-system concerns.',
    category: 'Electrical Systems',
    difficulty: 'Beginner',
    estimatedMinutes: 15,
    steps: [
      'Park safely, switch off the ignition, and inspect the battery for visible damage.',
      'Set a multimeter to DC volts and connect the probes to the matching battery terminals.',
      'Compare the reading with the battery and vehicle service specifications.',
      'If the reading is low, charge and retest the battery before replacing components.',
    ],
  },
  {
    $id: 'demo-brake-pad-inspection',
    $sequence: '0',
    $collectionId: 'demo',
    $databaseId: 'demo',
    $createdAt: '',
    $updatedAt: '',
    $permissions: [],
    title: 'Inspect Disc Brake Pads',
    description: 'Check pad wear, rotor condition, and hardware before deciding whether brake service is required.',
    category: 'Braking System',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    steps: [
      'Secure the vehicle on level ground and support it with correctly rated jack stands.',
      'Inspect pads on both sides of the axle and compare thickness with service limits.',
      'Check rotors for scoring, cracks, uneven wear, or heat damage.',
      'Reassemble to the manufacturer procedure and verify braking operation safely.',
    ],
  },
  {
    $id: 'demo-read-obd-codes',
    $sequence: '0',
    $collectionId: 'demo',
    $databaseId: 'demo',
    $createdAt: '',
    $updatedAt: '',
    $permissions: [],
    title: 'Read OBD-II Trouble Codes',
    description: 'Capture diagnostic codes and freeze-frame data as the first step in a structured engine diagnosis.',
    category: 'Diagnostics',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    steps: [
      'Locate the diagnostic connector and switch the ignition to the position specified by the scan tool.',
      'Connect the scanner and request stored, pending, and permanent codes.',
      'Save freeze-frame data and record the codes before clearing anything.',
      'Use service information and circuit tests to confirm the cause; a code alone does not identify a failed part.',
    ],
  },
  {
    $id: 'demo-engine-air-filter',
    $sequence: '0',
    $collectionId: 'demo',
    $databaseId: 'demo',
    $createdAt: '',
    $updatedAt: '',
    $permissions: [],
    title: 'Replace an Engine Air Filter',
    description: 'Inspect the intake filter and replace it correctly to maintain clean airflow to the engine.',
    category: 'Engine Systems',
    difficulty: 'Beginner',
    estimatedMinutes: 15,
    steps: [
      'Identify the air-filter housing and confirm the correct replacement part for the vehicle.',
      'Release the housing clips or fasteners and lift the cover without stressing the intake duct.',
      'Remove the filter and inspect the housing for debris or damage.',
      'Seat the new filter evenly, close the housing securely, and verify all connections.',
    ],
  },
];

export const findMockRepairGuide = (id: string): RepairGuide | undefined =>
  MOCK_REPAIR_GUIDES.find((guide) => guide.$id === id);
