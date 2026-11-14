const STAFF_ROLES = new Set(['instructor', 'mechanic']);

function deny(message) {
  const error = new Error(message);
  error.code = 'FORBIDDEN';
  throw error;
}

/**
 * Resolve the only tenant scope an actor may assign.
 * Never trust institutionId or garageId supplied by the browser.
 */
export function authorizeStaffInvitation(actor, requestedRole, requestedTenantId) {
  if (!actor || typeof actor !== 'object' || !actor.userId) {
    deny('Authenticated actor profile is required.');
  }
  if (actor.status === 'suspended' || actor.status === 'disabled') {
    deny('Suspended or disabled accounts cannot invite staff.');
  }
  if (!STAFF_ROLES.has(requestedRole)) {
    deny('Only instructor and mechanic invitations are supported.');
  }

  if (actor.role === 'global_admin') {
    if (!requestedTenantId || typeof requestedTenantId !== 'string') {
      deny('Global administrators must select a target institution or garage.');
    }
    return requestedRole === 'instructor'
      ? { role: requestedRole, institutionId: requestedTenantId, garageId: null }
      : { role: requestedRole, institutionId: null, garageId: requestedTenantId };
  }

  if (actor.role === 'tvet_admin') {
    if (requestedRole !== 'instructor' || !actor.institutionId) {
      deny('TVET administrators may invite instructors only within their institution.');
    }
    return { role: 'instructor', institutionId: actor.institutionId, garageId: null };
  }

  if (actor.role === 'garage_admin') {
    if (requestedRole !== 'mechanic' || !actor.garageId) {
      deny('Garage administrators may invite mechanics only within their garage.');
    }
    return { role: 'mechanic', institutionId: null, garageId: actor.garageId };
  }

  deny('Your role is not allowed to invite staff.');
}
