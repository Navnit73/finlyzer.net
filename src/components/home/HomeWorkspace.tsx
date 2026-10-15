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
        <div className="card-surface p-4 sm:p-8">
          <OcrWorkspace />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Cancel <main>'s top padding so the parchment hero meets the header. */}
      <div className="-mt-6 sm:-mt-10">
        <ConverterHero />
      </div>
      <MobileStickyCta />
    </>
  );
}
