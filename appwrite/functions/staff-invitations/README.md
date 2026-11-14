# AutoFix AI — Staff Invitations Function

Dedicated Appwrite Function source. This branch updates the implementation for the existing Appwrite TablesDB schema. It is not deployed or connected to production.

## Actions
- `bootstrap_student`: creates the authenticated user's student profile, idempotently.
- `invite_staff`: TVET Admin invites instructors only to their own institution; Garage Admin invites mechanics only to their own garage; Global Admin can choose a school/garage.
- `list_staff`: Garage Admin can list mechanics in their own garage.
- `list_tenant_profiles`: TVET Admin can list students and instructors in their own institution.
- `list_global_profiles`: Global Admin can list profile summaries; currently returns the first 100 profiles.
- `get_service_request_details`: Garage Admin can retrieve a minimal vehicle summary and customer profile for a service request owned by their own garage.
- `update_self_profile`: updates only the authenticated user's fullName, preferredLanguage, avatarFileId.

## Data and authentication
- Uses TablesDB `/tablesdb/{databaseId}/tables/{tableId}/rows` endpoints for `profiles`, `schools`, `garages`, `service_requests`, and `vehicles`.
- Uses Appwrite Users API for Auth user creation/deletion.
- Identity is verified by validating the custom `x-autofix-user-jwt` header against `/account` in the original project. The frontend must generate a JWT from the original AutoFix AI project (`account.createJWT()`) and pass it as this custom Function execution header. The Function's own-project `x-appwrite-user-jwt` is only a fallback and must not be treated as an original-project token.
- Body actor IDs, client role fields, and tenant IDs from TVET/Garage Admins are not trusted.
- The frontend must send the original-project JWT using the custom `x-autofix-user-jwt` execution header. Never send an original-project JWT as the reserved `x-appwrite-user-jwt` header; Appwrite controls that header for its own Function project.

## Required configuration
Runtime: Node.js 26. Entrypoint: `index.js`. Execute permission: `Any` (the function independently verifies the JWT).

Environment variables:
- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID` — original AutoFix AI project ID, because Auth/JWT and source tables live there.
- `APPWRITE_DATABASE_ID` — existing TablesDB database ID `autofix-ai-db`.
- `APPWRITE_API_KEY` — secret server key for the original project. Required scopes: `users.write`, `rows.read`, `rows.write`.
- `APPWRITE_APP_URL` — exact HTTPS frontend origin; recovery redirect must be allowed in Appwrite project settings.

## Critical permission prerequisite
The existing `profiles` table has table-level `create("users")`. This allows authenticated clients to attempt direct profile-row creation, potentially bypassing server-side role checks. Remove that table-level create permission only after auditing current frontend flows and confirming no legitimate client feature relies on it. Do not grant client update permissions on profile rows; profile updates go through the field-allowlisted Function action. The Function's server API key bypasses table permissions.

Rows created by this Function are readable only by the new user and inviter. Tenant staff lists are returned by server-side role/scope-filtered actions.

## Invitation flow
The Function creates an Auth user with a cryptographically random temporary password, creates the scoped profile row, then requests Appwrite Account Recovery to send a password-setup link to `/reset-password`. The temporary password is never returned or logged. If profile creation or recovery-email initiation fails, it best-effort deletes the new profile row and Auth user.

The frontend must implement `account.updateRecovery(userId, secret, password, passwordAgain)`. Appwrite's recovery redirect domain and built-in/custom email delivery must be configured before enabling invitations.

## Verification
Run `npm test`, `npm run check`, and `node --check index.js`. Unit tests are not a substitute for staging integration tests.
