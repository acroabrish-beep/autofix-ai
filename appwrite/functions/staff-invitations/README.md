# AutoFix AI — Staff Invitations Function

Dedicated Appwrite Function source. Not deployed or connected to production.

## Actions
- `bootstrap_student`: creates the authenticated user's student profile, idempotently.
- `invite_staff`: TVET Admin invites instructors only to their own institution; Garage Admin invites mechanics only to their own garage; Global Admin can choose a school/garage.
- `list_staff`: Garage Admin can list mechanics in their own garage.
- `list_tenant_profiles`: TVET Admin can list students and instructors in their own institution.
- `list_global_profiles`: Global Admin can list profile summaries; the response includes a total count and currently returns the first 100 profiles.
- `get_service_request_details`: Garage Admin can retrieve a minimal vehicle summary and customer profile for a service request owned by their own garage.
- `update_self_profile`: updates only the authenticated user's fullName, preferredLanguage, avatarFileId.

Identity is verified using Appwrite's injected `x-appwrite-user-jwt` against `/account`. Body actor IDs, client role fields, and tenant IDs from TVET/Garage Admins are not trusted.

## Required configuration
Runtime: Node.js 26. Entrypoint: `index.js`. Execute permission: `Any` (the function independently verifies the JWT).

Environment variables:
- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_DATABASE_ID`
- `APPWRITE_API_KEY` — secret, newly rotated key only
- `APPWRITE_APP_URL` — exact HTTPS frontend origin; recovery redirect must be allowed in Appwrite project settings

Execution key scopes: `users.write`, `databases.read`, `databases.write`.

## Critical collection permission prerequisite
The current `profiles` collection has collection-level `create("users")`. This lets any authenticated user bypass the Function and try to create an arbitrary role profile directly. Remove that collection-level create permission before enabling the frontend integration. The Function's server API key bypasses collection permissions. Do not grant client update permissions on profile documents; profile updates go through the field-allowlisted Function action.

Profile document permissions created by this Function are read-only for the new user and the inviter. Tenant staff lists are returned by server-side role/scope-filtered actions.

## Invitation flow
The Function creates an Auth user with a cryptographically random temporary password, creates the scoped profile, then requests Appwrite Account Recovery to send a password-setup link to `/reset-password`. The temporary password is never returned or logged. If profile creation or recovery-email initiation fails, it best-effort deletes the new profile and Auth user.

The frontend must implement `account.updateRecovery(userId, secret, password, passwordAgain)`. Appwrite's recovery redirect domain and built-in/custom email delivery must be configured before enabling invitations.

## Tests
`npm test` and `node --check index.js`. Unit tests are not a substitute for staging integration tests.
