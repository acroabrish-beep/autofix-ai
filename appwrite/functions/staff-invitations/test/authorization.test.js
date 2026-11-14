import test from 'node:test';
import assert from 'node:assert/strict';
import { authorizeStaffInvitation, validateInviteInput, profilePermissions } from '../authorization.js';

test('TVET admin scope comes from actor, not forged tenant id', () => {
  assert.deepEqual(authorizeStaffInvitation(
    { userId: 'school-admin', role: 'tvet_admin', institutionId: 'school-A' }, 'instructor', 'attacker'
  ), { role: 'instructor', institutionId: 'school-A', garageId: null, collectionId: 'schools' });
});
test('Garage admin scope comes from actor, not forged tenant id', () => {
  assert.deepEqual(authorizeStaffInvitation(
    { userId: 'garage-admin', role: 'garage_admin', garageId: 'garage-A' }, 'mechanic', 'attacker'
  ), { role: 'mechanic', institutionId: null, garageId: 'garage-A', collectionId: 'garages' });
});
test('TVET admin cannot invite mechanic', () => assert.throws(() => authorizeStaffInvitation(
  { userId: 'school-admin', role: 'tvet_admin', institutionId: 'school-A' }, 'mechanic', 'garage-A'
), { code: 'FORBIDDEN' }));
test('Garage admin cannot invite instructor', () => assert.throws(() => authorizeStaffInvitation(
  { userId: 'garage-admin', role: 'garage_admin', garageId: 'garage-A' }, 'instructor', 'school-A'
), { code: 'FORBIDDEN' }));
test('Student cannot invite staff', () => assert.throws(() => authorizeStaffInvitation(
  { userId: 'student', role: 'student' }, 'instructor', 'school-A'
), { code: 'FORBIDDEN' }));
test('Non-active actors cannot invite staff', () => {
  for (const status of ['suspended', 'pending', 'disabled']) assert.throws(() => authorizeStaffInvitation(
    { userId: 'admin', role: 'tvet_admin', institutionId: 'school-A', status }, 'instructor', 'school-A'
  ), { code: 'FORBIDDEN' });
});
test('Global admin must choose a tenant and cannot assign arbitrary roles', () => {
  const actor = { userId: 'global', role: 'global_admin' };
  assert.throws(() => authorizeStaffInvitation(actor, 'instructor', ''), { code: 'FORBIDDEN' });
  assert.throws(() => authorizeStaffInvitation(actor, 'global_admin', 'school-A'), { code: 'FORBIDDEN' });
});
test('Input normalizes email and validates required fields', () => {
  assert.deepEqual(validateInviteInput({
    fullName: ' Demo Instructor ', email: ' DEMO@EXAMPLE.COM ', role: 'instructor', tenantId: 'school-A',
  }), { fullName: 'Demo Instructor', email: 'demo@example.com', role: 'instructor', tenantId: 'school-A', phone: '', specialization: '' });
  assert.throws(() => validateInviteInput({ fullName: 'A', email: 'bad', role: 'instructor' }), { code: 'INVALID_INPUT' });
});
test('Profile permissions allow read only to new user and inviter', () => {
  assert.deepEqual(profilePermissions('new', 'inviter'), ['read("user:new")', 'read("user:inviter")']);
  assert.deepEqual(profilePermissions('new', 'new'), ['read("user:new")']);
});
