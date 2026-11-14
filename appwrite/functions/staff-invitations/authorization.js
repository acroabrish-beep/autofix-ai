const STAFF_ROLES = new Set(['instructor', 'mechanic']);

function deny(message) {
  const error = new Error(message);
  error.code = 'FORBIDDEN';
  throw error;
}

export function authorizeStaffInvitation(actor, requestedRole, requestedTenantId) {
  if (!actor || typeof actor !== 'object' || !actor.userId) deny('Authenticated actor profile is required.');
  if (actor.status && actor.status !== 'active') deny('Only active accounts can invite staff.');
  if (!STAFF_ROLES.has(requestedRole)) deny('Only instructor and mechanic invitations are supported.');

  if (actor.role === 'global_admin') {
    if (!requestedTenantId || typeof requestedTenantId !== 'string') deny('Global administrators must select a target institution or garage.');
    return requestedRole === 'instructor'
      ? { role: requestedRole, institutionId: requestedTenantId, garageId: null, collectionId: 'schools' }
      : { role: requestedRole, institutionId: null, garageId: requestedTenantId, collectionId: 'garages' };
  }
  if (actor.role === 'tvet_admin') {
    if (requestedRole !== 'instructor' || !actor.institutionId) deny('TVET administrators may invite instructors only within their institution.');
    return { role: 'instructor', institutionId: actor.institutionId, garageId: null, collectionId: 'schools' };
  }
  if (actor.role === 'garage_admin') {
    if (requestedRole !== 'mechanic' || !actor.garageId) deny('Garage administrators may invite mechanics only within their garage.');
    return { role: 'mechanic', institutionId: null, garageId: actor.garageId, collectionId: 'garages' };
  }
  deny('Your role is not allowed to invite staff.');
}

export function validateInviteInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Invitation details are required.'), { code: 'INVALID_INPUT' });
  }
  const fullName = typeof input.fullName === 'string' ? input.fullName.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  const phone = typeof input.phone === 'string' ? input.phone.trim() : '';
  const specialization = typeof input.specialization === 'string' ? input.specialization.trim() : '';
  const role = typeof input.role === 'string' ? input.role.trim() : '';
  const tenantId = typeof input.tenantId === 'string' ? input.tenantId.trim() : '';

  if (fullName.length < 2 || fullName.length > 255) throw Object.assign(new Error('Full name must be between 2 and 255 characters.'), { code: 'INVALID_INPUT' });
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Object.assign(new Error('A valid email address is required.'), { code: 'INVALID_INPUT' });
  if (phone.length > 50 || specialization.length > 255) throw Object.assign(new Error('Phone or specialization is too long.'), { code: 'INVALID_INPUT' });
  return { fullName, email, phone, specialization, role, tenantId };
}

export function profilePermissions(userId, invitedBy) {
  const permissions = [`read("user:${userId}")`];
  if (invitedBy && invitedBy !== userId) permissions.push(`read("user:${invitedBy}")`);
  return permissions;
}

export function sanitizeProfileUpdate(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw Object.assign(new Error('Profile update data is required.'), { code: 'INVALID_INPUT' });
  }
  const data = {};
  if (typeof raw.fullName === 'string') {
    const name = raw.fullName.trim();
    if (name.length < 2 || name.length > 255) {
      throw Object.assign(new Error('Full name is invalid.'), { code: 'INVALID_INPUT' });
    }
    data.fullName = name;
  }
  if (typeof raw.preferredLanguage === 'string' && ['en', 'am', 'sid'].includes(raw.preferredLanguage)) {
    data.preferredLanguage = raw.preferredLanguage;
  }
  if (typeof raw.avatarFileId === 'string' && raw.avatarFileId.length <= 255) {
    data.avatarFileId = raw.avatarFileId;
  }
  if (!Object.keys(data).length) {
    throw Object.assign(new Error('No supported profile fields were supplied.'), { code: 'INVALID_INPUT' });
  }
  return data;
}
