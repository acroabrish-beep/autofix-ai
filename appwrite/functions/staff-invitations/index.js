import { randomBytes } from 'node:crypto';
import { authorizeStaffInvitation, validateInviteInput, profilePermissions } from './authorization.js';

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
  const jwt = req.headers?.['x-appwrite-user-jwt'];
  if (typeof jwt !== 'string' || !jwt) return null;
  try { return await call('/account', { method: 'GET', headers: { 'X-Appwrite-JWT': jwt } }, false); }
  catch { return null; }
}
const q = (field, value) => encodeURIComponent(JSON.stringify({ method: 'equal', attribute: field, values: [String(value)] }));
async function profileFor(userId) {
  const result = await call(`/databases/${databaseId}/collections/profiles/documents?queries[]=${q('userId', userId)}&limit=1`);
  return result?.documents?.[0] || null;
}
async function tenantFor(collection, id) {
  return call(`/databases/${databaseId}/collections/${collection}/documents/${encodeURIComponent(id)}`);
}
async function createProfile(userId, data, inviterId) {
  return call(`/databases/${databaseId}/collections/profiles/documents`, {
    method: 'POST',
    body: JSON.stringify({ documentId: userId, data, permissions: profilePermissions(userId, inviterId) }),
  });
}
async function removeProfile(userId) {
  return call(`/databases/${databaseId}/collections/profiles/documents/${encodeURIComponent(userId)}`, { method: 'DELETE' });
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
  let field, tenantId, role;
  if (actorProfile.role === 'tvet_admin' && actorProfile.institutionId) {
    field = 'institutionId'; tenantId = actorProfile.institutionId; role = 'instructor';
  } else if (actorProfile.role === 'garage_admin' && actorProfile.garageId && !schoolProfiles) {
    field = 'garageId'; tenantId = actorProfile.garageId; role = 'mechanic';
  } else throw Object.assign(new Error('Your account cannot list profiles for this tenant.'), { code: 'FORBIDDEN' });
  const result = await call(`/databases/${databaseId}/collections/profiles/documents?queries[]=${q(field, tenantId)}&limit=100`);
  return (result?.documents || []).filter(p => schoolProfiles ? ['student', 'instructor'].includes(p.role) : p.role === role).map(p => ({
    $id: p.$id, userId: p.userId, fullName: p.fullName, email: p.email, phone: p.phone || '',
    specialization: p.specialization || '', role: p.role, institutionId: p.institutionId,
    garageId: p.garageId, status: p.status,
  }));
}
async function updateOwnProfile(account, raw) {
  const profile = await profileFor(account.$id);
  if (!profile) throw Object.assign(new Error('Profile not found.'), { code: 'NOT_FOUND' });
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Object.assign(new Error('Profile update data is required.'), { code: 'INVALID_INPUT' });
  const data = {};
  if (typeof raw.fullName === 'string') {
    const name = raw.fullName.trim();
    if (name.length < 2 || name.length > 255) throw Object.assign(new Error('Full name is invalid.'), { code: 'INVALID_INPUT' });
    data.fullName = name;
  }
  if (typeof raw.preferredLanguage === 'string' && ['en', 'am', 'sid'].includes(raw.preferredLanguage)) data.preferredLanguage = raw.preferredLanguage;
  if (typeof raw.avatarFileId === 'string' && raw.avatarFileId.length <= 255) data.avatarFileId = raw.avatarFileId;
  if (!Object.keys(data).length) throw Object.assign(new Error('No supported profile fields were supplied.'), { code: 'INVALID_INPUT' });
  data.updatedAt = new Date().toISOString();
  return call(`/databases/${databaseId}/collections/profiles/documents/${encodeURIComponent(profile.$id)}`, {
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
    if (body.action === 'update_self_profile') return reply(res, { success: true, data: await updateOwnProfile(account, body.payload) });
    return reply(res, { error: 'Unsupported action.' }, 400);
  } catch (err) {
    error(err?.message || 'Staff invitation request failed.');
    const status = err?.code === 'FORBIDDEN' ? 403 : err?.code === 'INVALID_INPUT' ? 400
      : err?.code === 'NOT_FOUND' ? 404 : err?.status === 409 ? 409 : 500;
    return reply(res, { error: err?.message || 'An internal error occurred.' }, status);
  }
};
