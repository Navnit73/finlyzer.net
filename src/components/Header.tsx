'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TrendingUp, Sparkles, CreditCard, BarChart3 } from 'lucide-react';
import UserMenu from './auth/UserMenu';
import HistoryDrawer from './ocr/HistoryDrawer';

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const isLoggedIn = status === 'authenticated' && !!session?.user;

  return (
    <>
      {/* Global Flat Header */}
      <header className="sticky top-0 z-40 w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] transition-colors">
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

            {/* Center / Navigation Links (Guest) */}
            {!isLoggedIn && (
              <div className="hidden md:flex items-center gap-6 text-xs font-bold text-[var(--color-text-secondary)]">
                <Link href="/convert" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-hover)]" />
                  <span>All Bank Converters</span>
                </Link>
                <Link href="/pricing" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[var(--media-violet)]" />
                  <span>Pricing</span>
                </Link>
              </div>
            )}

            {/* Center / Navigation Links (Authenticated Only) */}
            {isLoggedIn && (
              <div className="hidden md:flex items-center gap-6 text-xs font-bold text-[var(--color-text-secondary)]">
                <Link href="/dashboard" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-[var(--color-ink)]" />
                  <span>Dashboard</span>
                </Link>

                <Link href="/convert" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-hover)]" />
                  <span>Converters Hub</span>
                </Link>

                <Link href="/documents" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <span>Document Vault</span>
                </Link>

                <Link href="/invoices" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <span>Invoices</span>
                </Link>

                <Link href="/pricing" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[var(--media-violet)]" />
                  <span>Pricing &amp; Credits</span>
                </Link>

                {/* SuperAdmin Link */}
                <Link href="/superadmin" className="hover:text-[var(--color-ink)] text-[var(--color-text-secondary)] transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-hover)]" />
                  <span>SuperAdmin</span>
                </Link>
              </div>
            )}

            {/* Account Actions & User Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              <UserMenu onOpenHistory={isLoggedIn ? () => setIsHistoryOpen(true) : undefined} />
            </div>
          </nav>
        </div>
      </header>

      {/* Global History Drawer (Only for Authenticated Users) */}
      {isLoggedIn && (
        <HistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectDocument={(id) => {
            setIsHistoryOpen(false);
            router.push(`/document/${id}`);
          }}
        />
      )}
    </>
  );
}
