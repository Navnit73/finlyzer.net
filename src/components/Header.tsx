'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { TrendingUp } from "lucide-react";
import UserMenu from "./auth/UserMenu";
import HistoryDrawer from "./ocr/HistoryDrawer";

export default function Header() {
  const router = useRouter();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
      {/* Global Sticky Header */}
      <header className="sticky top-0 z-40 w-full bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)] transition-all">
        <div className="site-container">
          <nav className="flex items-center justify-between h-16 sm:h-20" aria-label="Main Navigation">
            {/* Brand Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center gap-2.5 text-xl sm:text-2xl font-black tracking-tight text-[var(--color-ink)] hover:opacity-90 transition-opacity"
                aria-label="Finlyzer - Home"
              >
                <span className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-on-brand)] shadow-xs">
                  <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                </span>
                <span className="flex items-center">
                  Fin<span className="text-[var(--color-ink)]">lyzer</span>
                </span>
              </Link>
            </div>

            {/* Account Actions & Single Sign In Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <UserMenu onOpenHistory={() => setIsHistoryOpen(true)} />
            </div>
          </nav>
        </div>
      </header>

      {/* Global History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectDocument={(id) => {
          setIsHistoryOpen(false);
          router.push(`/document/${id}`);
        }}
      />
    </>
  );
}

