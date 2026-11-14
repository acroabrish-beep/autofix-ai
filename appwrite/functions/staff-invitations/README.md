# Staff invitation authorization (not deployed)

This module contains the role/tenant policy for the planned server-side staff
invitation Function. It is intentionally not wired to the production Appwrite
project yet.

## Current safety behavior

- Browser-side profile creation is student-only.
- Browser-side profile updates cannot change role, user ID, status, institution,
  or garage ownership.
- School Admin and Garage Admin staff-creation forms are disabled and clearly
  report that no account/profile was created.
- The policy helper derives a TVET Admin's institution or Garage Admin's garage
  from the authenticated actor profile. Client-supplied tenant IDs are ignored
  for those roles.
- Global Admin may select a target tenant, but only instructor/mechanic target
  roles are accepted.

## Required before activation

The real invitation endpoint must verify the Appwrite user JWT, load the actor
profile server-side, enforce this policy, create an actual Appwrite Auth user,
and create a profile with reviewed document permissions. It must also send a
one-time activation/password-setup email and roll back the account/profile if
delivery fails.

The current Appwrite Function has only been inspected; its service scopes do
not yet authorize the required user and profile writes. Email delivery and the
profile read model/document permissions also need configuration and testing.
Do not deploy this helper or enable the UI until those prerequisites are met.

## Tests

Run from this directory:

```sh
node --test test/authorization.test.js
```
