'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminShell from './AdminShell';
import { ActiveJobsProvider } from '@/context/ActiveJobsContext';
import ActiveJobFloatingTracker from '@/components/ocr/ActiveJobFloatingTracker';

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

  // Determine if we should render the Admin Layout:
  // ONLY render Admin Layout for authenticated logged-in users!
  // Unauthenticated guests NEVER see the admin sidebar layout.
  const showAdminLayout =
    (status === 'authenticated' && !!session?.user) ||
    (status === 'loading' && cachedLoggedIn === true);

  // For authenticated logged-in users, render AdminShell
  if (showAdminLayout) {
    return (
      <ActiveJobsProvider>
        <AdminShell>{children}</AdminShell>
        <ActiveJobFloatingTracker />
      </ActiveJobsProvider>
    );
  }

  // Public Guest Layout
  return (
    <ActiveJobsProvider>
      <div className="min-h-screen flex flex-col bg-[var(--color-surface)] text-[var(--color-ink)]">
        <Header />
        <main className="flex-1 w-full site-container py-6 sm:py-10">
          {children}
        </main>
        <Footer />
        <ActiveJobFloatingTracker />
      </div>
    </ActiveJobsProvider>
  );
}
