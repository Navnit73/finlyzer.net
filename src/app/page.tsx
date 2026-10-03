'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import OcrWorkspace from '@/components/ocr/OcrWorkspace';
import GuestWorkspace from '@/components/guest/GuestWorkspace';

export default function Home() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && !!session?.user;

  if (isLoggedIn) {
    return (
      <div className="w-full">
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 sm:p-8 shadow-none">
          <OcrWorkspace />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <GuestWorkspace />
    </div>
  );
}
