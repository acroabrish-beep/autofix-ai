# Appwrite Function security source

This folder tracks the authentication primitive used by the diagnostic/admin function.
The runtime entrypoint must call `getAuthenticatedAccount(req)` before any service-role
database operation, then look up that account's profile and enforce role/status server-side.
Never accept `actorId` or `x-appwrite-user-id` as identity proof.

The deployed function source is currently managed separately in Appwrite Cloud; this
tracked helper is not a deployment. Keep deployment disabled until the full source is
synced, tested, and reviewed.
