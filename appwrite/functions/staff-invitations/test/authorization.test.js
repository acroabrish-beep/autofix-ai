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

test('Profile update accepts only safe self-edit fields', async () => {
  const { sanitizeProfileUpdate } = await import('../authorization.js');
  assert.deepEqual(sanitizeProfileUpdate({
    fullName: '  New Name  ',
    preferredLanguage: 'am',
    avatarFileId: 'file-1',
    role: 'global_admin',
    institutionId: 'other-school',
    garageId: 'other-garage',
    status: 'active',
    userId: 'another-user',
  }), { fullName: 'New Name', preferredLanguage: 'am', avatarFileId: 'file-1' });
});
test('Profile update rejects role-only or invalid language updates', async () => {
  const { sanitizeProfileUpdate } = await import('../authorization.js');
  assert.throws(() => sanitizeProfileUpdate({ role: 'global_admin' }), { code: 'INVALID_INPUT' });
  assert.throws(() => sanitizeProfileUpdate({ preferredLanguage: 'fr' }), { code: 'INVALID_INPUT' });
});

test('Instructor profile listing is limited to students in their own institution', async () => {
  const { resolveProfileListScope } = await import('../authorization.js');
  assert.deepEqual(resolveProfileListScope(
    { userId: 'instructor-1', role: 'instructor', institutionId: 'school-A' }, 'school'
  ), { field: 'institutionId', tenantId: 'school-A', roles: ['student'] });
});
test('TVET admin profile listing includes only its own institution users', async () => {
  const { resolveProfileListScope } = await import('../authorization.js');
  assert.deepEqual(resolveProfileListScope(
    { userId: 'school-admin', role: 'tvet_admin', institutionId: 'school-A' }, 'school'
  ), { field: 'institutionId', tenantId: 'school-A', roles: ['student', 'instructor'] });
});
test('Garage Admin profile listing is limited to mechanics in its own garage', async () => {
  const { resolveProfileListScope } = await import('../authorization.js');
  assert.deepEqual(resolveProfileListScope(
    { userId: 'garage-admin', role: 'garage_admin', garageId: 'garage-A' }, 'staff'
  ), { field: 'garageId', tenantId: 'garage-A', roles: ['mechanic'] });
});
test('Global profile listing requires global_admin', async () => {
  const { assertGlobalAdmin } = await import('../authorization.js');
  assertGlobalAdmin({ role: 'global_admin' });
  assert.throws(() => assertGlobalAdmin({ role: 'tvet_admin' }), { code: 'FORBIDDEN' });
});
test('Garage customer lookup rejects requests belonging to another garage', async () => {
  const { assertGarageRequestAccess } = await import('../authorization.js');
  assertGarageRequestAccess({ role: 'garage_admin', garageId: 'garage-A' }, { garageId: 'garage-A' });
  assert.throws(() => assertGarageRequestAccess(
    { role: 'garage_admin', garageId: 'garage-A' }, { garageId: 'garage-B' }
  ), { code: 'FORBIDDEN' });
});
