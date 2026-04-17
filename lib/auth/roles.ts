/**
 * Client/server helpers for admin vs customer live in `lib/auth/user-role.ts`
 * (`public.user_roles`). Do not use JWT `app_metadata.role` for authorization.
 */
export { getAppRoleForUser, isAdminAppRole, type AppRole } from "./user-role";
