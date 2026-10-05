'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminShell from './AdminShell';
import { ActiveJobsProvider } from '@/context/ActiveJobsContext';
import ActiveJobFloatingTracker from '@/components/ocr/ActiveJobFloatingTracker';
import { isAppRoute, isPublicOnlyRoute } from '@/lib/routes';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [cachedLoggedIn, setCachedLoggedIn] = useState<boolean | null>(null);

  // The session cookie is httpOnly, so a localStorage hint is the only way to avoid a
  // public-header flash on shared pages while the session is still loading.
  useEffect(() => {
    try {
      setCachedLoggedIn(localStorage.getItem('has_logged_in') === 'true');
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

  // Layout is decided by route first, then by auth state:
  // - app routes always use the app shell (src/proxy.ts already blocks guests)
  // - marketing routes always use the public shell (src/proxy.ts already redirects signed-in users)
  // - shared routes (/pricing, /document/[id]) follow the session
  const isAuthenticated = status === 'authenticated' && !!session?.user;
  const showAdminLayout = isAppRoute(pathname)
    ? true
    : isPublicOnlyRoute(pathname)
      ? false
      : isAuthenticated || (status === 'loading' && cachedLoggedIn === true);

  if (showAdminLayout) {
    return (
      <ActiveJobsProvider>
        <AdminShell>{children}</AdminShell>
        <ActiveJobFloatingTracker />
      </ActiveJobsProvider>
    );
  }

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
