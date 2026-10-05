'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import ConverterHero from '@/components/converter/ConverterHero';
import OcrWorkspace from '@/components/ocr/OcrWorkspace';
import MobileStickyCta from '@/components/converter/MobileStickyCta';

export default function HomeWorkspace() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && !!session?.user;

  if (isLoggedIn) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-4 sm:p-8 shadow-xs">
          <OcrWorkspace />
        </div>
      </div>
    );
  }

  return (
    <>
      <ConverterHero />
      <MobileStickyCta />
    </>
  );
}
