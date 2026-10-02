import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { findOrCreateUser } from './models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    }),
    // 1-Click Demo / Test Provider for instant development and preview
    CredentialsProvider({
      id: 'google-demo',
      name: 'Google Demo Login',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        name: { label: 'Name', type: 'text', placeholder: 'Demo User' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return {
            id: 'google_user_demo_1',
            email: 'demo.analyst@finlyzer.net',
            name: 'Demo Financial Analyst',
            image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces',
          };
        }
        return {
          id: `usr_${Math.random().toString(36).substring(2, 9)}`,
          email: credentials.email,
          name: credentials.name || 'Financial Analyst',
          image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces',
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (user?.email) {
        try {
          await findOrCreateUser(user.email, user.name, user.image);
        } catch (e) {
          console.warn('Could not persist user to MongoDB:', e);
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
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'finlyzer_super_secret_session_jwt_2026',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
