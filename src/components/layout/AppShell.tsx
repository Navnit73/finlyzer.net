'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminShell from './AdminShell';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [cachedLoggedIn, setCachedLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const hasAuthCookie =
        document.cookie.includes('next-auth.session-token') ||
        document.cookie.includes('__Secure-next-auth.session-token');
      const hasLocalStorageFlag = localStorage.getItem('has_logged_in') === 'true';
      setCachedLoggedIn(hasAuthCookie || hasLocalStorageFlag);
    } catch {
      setCachedLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      try {
        localStorage.setItem('has_logged_in', 'true');
      } catch {}
    } else if (status === 'unauthenticated') {
      try {
        localStorage.removeItem('has_logged_in');
      } catch {}
    }
  }, [status, session]);

  const isAdminRoute =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard') ||
    pathname === '/documents' ||
    pathname === '/pricing' ||
    pathname === '/invoices' ||
    pathname.startsWith('/document/');

  // Determine if we should render the Admin Layout:
  // 1. Authenticated session exists
  // 2. Dedicated admin route is active (prevents flashing landing page header/footer on reload)
  // 3. Initial loading state on root with cached login session
  const showAdminLayout =
    (status === 'authenticated' && !!session?.user) ||
    isAdminRoute ||
    (status === 'loading' && cachedLoggedIn === true);

  if (showAdminLayout) {
    return <AdminShell>{children}</AdminShell>;
  }

  // If still resolving session on root '/' and not cached as logged in, render neutral surface
  if (status === 'loading' && cachedLoggedIn === null) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2.5">
          <span className="loading loading-spinner loading-md text-[var(--color-brand)]"></span>
          <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Loading workspace...</span>
        </div>
      </div>
    );
  }

  // Public Guest Layout
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-ink)]">
      <Header />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
