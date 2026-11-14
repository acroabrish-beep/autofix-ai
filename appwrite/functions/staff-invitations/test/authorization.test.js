import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeStaffInvitation } from '../authorization.js';

test('TVET admin can invite an instructor only into the actor institution', () => {
  const result = authorizeStaffInvitation(
    { userId: 'school-admin-1', role: 'tvet_admin', institutionId: 'school-A' },
    'instructor',
    'attacker-school'
  );
  assert.deepEqual(result, { role: 'instructor', institutionId: 'school-A', garageId: null });
});

test('garage admin can invite a mechanic only into the actor garage', () => {
  const result = authorizeStaffInvitation(
    { userId: 'garage-admin-1', role: 'garage_admin', garageId: 'garage-A' },
    'mechanic',
    'attacker-garage'
  );
  assert.deepEqual(result, { role: 'mechanic', institutionId: null, garageId: 'garage-A' });
});

test('TVET admin cannot invite mechanics', () => {
  assert.throws(() => authorizeStaffInvitation(
    { userId: 'school-admin-1', role: 'tvet_admin', institutionId: 'school-A' },
    'mechanic', 'garage-A'
  ), { code: 'FORBIDDEN' });
});

test('garage admin cannot invite instructors', () => {
  assert.throws(() => authorizeStaffInvitation(
    { userId: 'garage-admin-1', role: 'garage_admin', garageId: 'garage-A' },
    'instructor', 'school-A'
  ), { code: 'FORBIDDEN' });
});

test('student cannot invite staff', () => {
  assert.throws(() => authorizeStaffInvitation(
    { userId: 'student-1', role: 'student', institutionId: 'school-A' },
    'instructor', 'school-A'
  ), { code: 'FORBIDDEN' });
});

test('suspended admin cannot invite staff', () => {
  assert.throws(() => authorizeStaffInvitation(
    { userId: 'school-admin-1', role: 'tvet_admin', institutionId: 'school-A', status: 'suspended' },
    'instructor', 'school-A'
  ), { code: 'FORBIDDEN' });
});

test('unknown role cannot be provisioned', () => {
  assert.throws(() => authorizeStaffInvitation(
    { userId: 'global-1', role: 'global_admin' },
    'global_admin', 'school-A'
  ), { code: 'FORBIDDEN' });
});

test('global admin must explicitly select a tenant', () => {
  assert.throws(() => authorizeStaffInvitation(
    { userId: 'global-1', role: 'global_admin' },
    'instructor', ''
  ), { code: 'FORBIDDEN' });
});
