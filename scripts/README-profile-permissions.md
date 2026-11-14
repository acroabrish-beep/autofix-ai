# Profile permission hardening migration

This script is a dry-run by default. It removes client-side profile write paths that could otherwise bypass the JWT-verified staff Function.

## What it changes with --apply
1. Removes every non-read permission from existing profile documents. It preserves only user-specific read permissions (not broad `read(\"users\")` access) and ensures each profile owner retains `read("user:<userId>")`.
2. Removes collection-level `create(...)`, `update(...)`, and `delete(...)` permissions from the `profiles` collection. The server Function uses its API key and can still create profiles.

## Required rollout order
1. Rotate the previously exposed Appwrite API key. Create a replacement with only `users.write`, `databases.read`, and `databases.write`; mark the Function variable Secret.
2. Create and configure the `staff-invitations` Function, verify its JWT execution and recovery email flow in an isolated/staging project.
3. Deploy the frontend release that uses the Function.
4. During a coordinated maintenance window, run this migration with `--apply`. Older cached frontend bundles that still write profiles directly will stop working, so do not run it before the Function-based frontend is ready.
5. Verify signup, profile editing, school staff lists, garage staff lists, and cross-tenant access tests.

## Environment
Set `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_DATABASE_ID`, and a newly rotated `APPWRITE_API_KEY`. Never put secrets in the repository or chat.

## Commands
Dry run:

```sh
node scripts/secure-profiles-permissions.mjs
```

Apply only after reviewing the dry-run output and completing the rollout prerequisites:

```sh
node scripts/secure-profiles-permissions.mjs --apply
```

This script has not been run against production.
