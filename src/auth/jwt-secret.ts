/**
 * Central JWT secret for signing/verifying. Use this everywhere so token signed at login
 * is verified with the same secret on protected routes.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim() || process.env.JWT_SECRET;
  return secret || 'dev-secret-change-in-production';
}
