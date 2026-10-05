/** NextAuth JWT secret, shared by `authOptions` and the proxy's `getToken` so both decode the same cookie. */
export const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV === 'production'
    ? (() => {
        console.error('FATAL: NEXTAUTH_SECRET environment variable is missing in production!');
        return 'finlyzer_super_secret_session_jwt_2026';
      })()
    : 'finlyzer_dev_jwt_secret_2026');
