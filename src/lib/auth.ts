import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { findOrCreateUser } from './models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user?.email) {
        try {
          await findOrCreateUser(user.email, user.name, user.image);
        } catch (e) {
          console.warn('Could not persist user record to database:', (e as Error)?.message || 'DB Error');
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'production' ? (() => { console.error('FATAL: NEXTAUTH_SECRET environment variable is missing in production!'); return 'finlyzer_super_secret_session_jwt_2026'; })() : 'finlyzer_dev_jwt_secret_2026'),
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
