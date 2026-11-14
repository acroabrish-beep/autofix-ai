import { randomBytes } from 'node:crypto';
import { equalQuery, tableRowsPath, tableRowPath } from './tablesdb.js';
import { authorizeStaffInvitation, validateInviteInput, profilePermissions, sanitizeProfileUpdate, resolveProfileListScope, assertGlobalAdmin, assertGarageRequestAccess } from './authorization.js';

const endpoint = process.env.APPWRITE_ENDPOINT;
const projectId = process.env.APPWRITE_PROJECT_ID;
const databaseId = process.env.APPWRITE_DATABASE_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const appUrl = process.env.APPWRITE_APP_URL;

function reply(res, data, status = 200) { return res.json(data, status); }
function config() {
  if (![endpoint, projectId, databaseId, apiKey, appUrl].every(Boolean)) throw new Error('Staff invitation Function is not fully configured.');
  const url = new URL(appUrl);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') throw new Error('APPWRITE_APP_URL must use HTTPS.');
}
async function call(path, options = {}, withKey = true) {
  const response = await fetch(`${endpoint}${path}`, {
    ...options,
    headers: {
      'X-Appwrite-Project': projectId,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(withKey ? { 'X-Appwrite-Key': apiKey } : {}),
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  let data = null;
  if (raw) { try { data = JSON.parse(raw); } catch { data = { message: raw }; } }
  if (!response.ok) {
    throw Object.assign(new Error(data?.message || `Appwrite request failed (${response.status}).`), {
      status: response.status, type: data?.type,
    });
  }
  return data;
}
async function authenticatedAccount(req) {
  const jwt = req.headers?.['x-autofix-user-jwt'] || req.headers?.['x-appwrite-user-jwt'];
  if (typeof jwt !== 'string' || !jwt) return null;
  try { return await call('/account', { method: 'GET', headers: { 'X-Appwrite-JWT': jwt } }, false); }
  catch { return null; }
}

async function profileFor(userId) {
  const result = await call(`${tableRowsPath(databaseId, 'profiles')}?queries[]=${equalQuery('userId', userId)}&limit=1`);
  return result?.rows?.[0] || null;
}
async function tenantFor(collection, id) {
  return call(tableRowPath(databaseId, collection, id));
}
async function createProfile(userId, data, inviterId) {
  return call(tableRowsPath(databaseId, 'profiles'), {
    method: 'POST',
    body: JSON.stringify({ rowId: userId, data, permissions: profilePermissions(userId, inviterId) }),
  });
}
async function removeProfile(userId) {
  return call(tableRowPath(databaseId, 'profiles', userId), { method: 'DELETE' });
}
async function removeUser(userId) {
  return call(`/users/${encodeURIComponent(userId)}`, { method: 'DELETE' });
}
async function sendPasswordSetup(email) {
  return call('/account/recovery', {
    method: 'POST',
    body: JSON.stringify({ email, url: new URL('/reset-password', appUrl).toString() }),
  }, false);
}
async function bootstrapStudent(account) {
  const existing = await profileFor(account.$id);
  if (existing) return { profile: existing, created: false };
  const now = new Date().toISOString();
  const profile = await createProfile(account.$id, {
    userId: account.$id, fullName: (account.name || 'Student').slice(0, 255), email: account.email,
    role: 'student', avatarFileId: '', preferredLanguage: 'en', status: 'active',
    createdAt: now, updatedAt: now,
  });
  return { profile, created: true };
}
async function inviteStaff(account, actorProfile, raw) {
  const input = validateInviteInput(raw);
  const scope = authorizeStaffInvitation(actorProfile, input.role, input.tenantId);
  const tenantId = scope.institutionId || scope.garageId;
  const tenant = await tenantFor(scope.collectionId, tenantId);
  if (tenant.status && tenant.status !== 'active') throw Object.assign(new Error('Staff can only be invited to an active institution or garage.'), { code: 'FORBIDDEN' });

  const password = randomBytes(48).toString('base64url');
  const user = await call('/users', {
    method: 'POST',
    body: JSON.stringify({ userId: 'unique()', email: input.email, password, name: input.fullName }),
  });
  let profileCreated = false;
  try {
    const now = new Date().toISOString();
    await createProfile(user.$id, {
      userId: user.$id, fullName: input.fullName, email: input.email, role: scope.role,
      ...(scope.institutionId ? { institutionId: scope.institutionId } : {}),
      ...(scope.garageId ? { garageId: scope.garageId } : {}),
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.specialization && scope.role === 'mechanic' ? { specialization: input.specialization } : {}),
      avatarFileId: '', preferredLanguage: 'en', status: 'active', createdAt: now, updatedAt: now,
    }, account.$id);
    profileCreated = true;
    await sendPasswordSetup(input.email);
  } catch (err) {
    if (profileCreated) { try { await removeProfile(user.$id); } catch { /* rollback best effort */ } }
    try { await removeUser(user.$id); } catch { /* rollback best effort */ }
    throw err;
  }
  return { userId: user.$id, email: input.email, role: scope.role, institutionId: scope.institutionId, garageId: scope.garageId, invitationSent: true };
}
async function scopedProfiles(actorProfile, schoolProfiles = false) {
  const scope = resolveProfileListScope(actorProfile, schoolProfiles ? 'school' : 'staff');
  const result = await call(`${tableRowsPath(databaseId, 'profiles')}?queries[]=${equalQuery(scope.field, scope.tenantId)}&limit=100`);
  return (result?.rows || []).filter(p => scope.roles.includes(p.role)).map(p => ({
    $id: p.$id, userId: p.userId, fullName: p.fullName, email: p.email, phone: p.phone || '',
    specialization: p.specialization || '', role: p.role, institutionId: p.institutionId,
    garageId: p.garageId, status: p.status,
  }));
}
async function serviceRequestDetails(actorProfile, requestId) {
  if (typeof requestId !== 'string' || !requestId) {
    throw Object.assign(new Error('Service request ID is required.'), { code: 'INVALID_INPUT' });
  }
  const request = await call(tableRowPath(databaseId, 'service_requests', requestId));
  assertGarageRequestAccess(actorProfile, request);
  if (!request.vehicleId) return { vehicle: null, owner: null };
  const vehicle = await call(tableRowPath(databaseId, 'vehicles', request.vehicleId));
  if (!vehicle.userId) return { vehicle: { make: vehicle.make, model: vehicle.model, year: vehicle.year, engine: vehicle.engine }, owner: null };
  const owner = await profileFor(vehicle.userId);
  return {
    vehicle: { make: vehicle.make, model: vehicle.model, year: vehicle.year, engine: vehicle.engine },
    owner: owner ? { $id: owner.$id, userId: owner.userId, fullName: owner.fullName, email: owner.email, phone: owner.phone || '' } : null,
  };
}

async function globalProfiles(actorProfile) {
  assertGlobalAdmin(actorProfile);
  const result = await call(`${tableRowsPath(databaseId, 'profiles')}?limit=100`);
  const profiles = (result?.rows || []).map(p => ({
    $id: p.$id, userId: p.userId, fullName: p.fullName, email: p.email,
    phone: p.phone || '', specialization: p.specialization || '', role: p.role,
    institutionId: p.institutionId, garageId: p.garageId, status: p.status,
  }));
  return { profiles, total: result?.total ?? profiles.length };
}

async function updateOwnProfile(account, raw) {
  const profile = await profileFor(account.$id);
  if (!profile) throw Object.assign(new Error('Profile not found.'), { code: 'NOT_FOUND' });
  const data = sanitizeProfileUpdate(raw);
  data.updatedAt = new Date().toISOString();
  return call(tableRowPath(databaseId, 'profiles', profile.$id), {
    method: 'PATCH', body: JSON.stringify({ data }),
  });
}

export default async ({ req, res, error }) => {
  if (req.method !== 'POST') return reply(res, { error: 'Method not allowed.' }, 405);
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
  catch { return reply(res, { error: 'Invalid JSON body.' }, 400); }
  try {
    config();
    const account = await authenticatedAccount(req);
    if (!account?.$id || !account.email) return reply(res, { error: 'Authentication required.' }, 401);
    if (body.action === 'bootstrap_student') return reply(res, { success: true, data: await bootstrapStudent(account) });

    const actorProfile = await profileFor(account.$id);
    if (!actorProfile || (actorProfile.status && actorProfile.status !== 'active')) return reply(res, { error: 'An active user profile is required.' }, 403);
    if (body.action === 'invite_staff') return reply(res, { success: true, data: await inviteStaff(account, actorProfile, body.payload) }, 201);
    if (body.action === 'list_staff') return reply(res, { success: true, data: await scopedProfiles(actorProfile) });
    if (body.action === 'list_tenant_profiles') return reply(res, { success: true, data: await scopedProfiles(actorProfile, true) });
    if (body.action === 'list_global_profiles') return reply(res, { success: true, data: await globalProfiles(actorProfile) });
    if (body.action === 'get_service_request_details') return reply(res, { success: true, data: await serviceRequestDetails(actorProfile, body.payload?.requestId) });
    if (body.action === 'update_self_profile') return reply(res, { success: true, data: await updateOwnProfile(account, body.payload) });
    return reply(res, { error: 'Unsupported action.' }, 400);
  } catch (err) {
    error(err?.message || 'Staff invitation request failed.');
    const status = err?.code === 'FORBIDDEN' ? 403 : err?.code === 'INVALID_INPUT' ? 400
      : err?.code === 'NOT_FOUND' ? 404 : err?.status === 409 ? 409 : 500;
    return reply(res, { error: err?.message || 'An internal error occurred.' }, status);
  }
};
