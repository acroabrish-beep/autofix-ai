import test from 'node:test';
import assert from 'node:assert/strict';
import {
  authorizeStaffInvitation, validateInviteInput, profilePermissions,
  sanitizeProfileUpdate, resolveProfileListScope, assertGlobalAdmin,
  assertGarageRequestAccess,
} from './authorization.js';

test('TVET admin can invite instructors only into own institution', () => {
  assert.deepEqual(
    authorizeStaffInvitation({ userId: 'a', role: 'tvet_admin', institutionId: 'school-1' }, 'instructor', ''),
    { role: 'instructor', institutionId: 'school-1', garageId: null, collectionId: 'schools' },
  );
});

test('garage admin cannot invite instructors or select another garage', () => {
  assert.throws(
    () => authorizeStaffInvitation({ userId: 'a', role: 'garage_admin', garageId: 'garage-1' }, 'instructor', 'school-2'),
    error => error.code === 'FORBIDDEN',
  );
});

test('global admin must select a tenant and receives matching table scope', () => {
  assert.throws(() => authorizeStaffInvitation({ userId: 'root', role: 'global_admin' }, 'mechanic', ''), { code: 'FORBIDDEN' });
  assert.deepEqual(
    authorizeStaffInvitation({ userId: 'root', role: 'global_admin' }, 'mechanic', 'garage-2'),
    { role: 'mechanic', institutionId: null, garageId: 'garage-2', collectionId: 'garages' },
  );
});

test('invitation input is normalized and validated', () => {
  assert.deepEqual(validateInviteInput({
    fullName: '  Test Mechanic ', email: ' TEST@EXAMPLE.COM ', role: 'mechanic', tenantId: 'g1',
  }), { fullName: 'Test Mechanic', email: 'test@example.com', phone: '', specialization: '', role: 'mechanic', tenantId: 'g1' });
  assert.throws(() => validateInviteInput({ fullName: 'x', email: 'bad', role: 'mechanic' }), { code: 'INVALID_INPUT' });
});

test('profile permissions grant read only to user and inviter', () => {
  assert.deepEqual(profilePermissions('u1', 'admin1'), ['read("user:u1")', 'read("user:admin1")']);
});

test('self profile update rejects role escalation fields', () => {
  assert.deepEqual(sanitizeProfileUpdate({ fullName: ' New Name ', role: 'global_admin', status: 'active' }), { fullName: 'New Name' });
  assert.throws(() => sanitizeProfileUpdate({ role: 'global_admin' }), { code: 'INVALID_INPUT' });
});

test('profile list scopes are tenant constrained', () => {
  assert.deepEqual(resolveProfileListScope({ role: 'garage_admin', garageId: 'g1' }, 'staff'), {
    field: 'garageId', tenantId: 'g1', roles: ['mechanic'],
  });
  assert.throws(() => resolveProfileListScope({ role: 'student' }, 'staff'), { code: 'FORBIDDEN' });
});

test('global profile listing requires global admin', () => {
  assert.throws(() => assertGlobalAdmin({ role: 'tvet_admin' }), { code: 'FORBIDDEN' });
});

test('garage service request access is tenant scoped', () => {
  assert.doesNotThrow(() => assertGarageRequestAccess({ role: 'garage_admin', garageId: 'g1' }, { garageId: 'g1' }));
  assert.throws(() => assertGarageRequestAccess({ role: 'garage_admin', garageId: 'g1' }, { garageId: 'g2' }), { code: 'FORBIDDEN' });
});
