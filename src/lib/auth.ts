import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { findOrCreateUser } from './models/User';
import { isAdminEmail } from './admin';
import { AUTH_SECRET } from './auth-secret';

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
      if (session.user) {
        session.user.isAdmin = isAdminEmail(session.user.email);
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
  secret: AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
