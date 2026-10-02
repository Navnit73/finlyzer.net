'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { TrendingUp, Sparkles, CreditCard, BarChart3 } from 'lucide-react';
import UserMenu from './auth/UserMenu';
import HistoryDrawer from './ocr/HistoryDrawer';
import AuthModal from './auth/AuthModal';

export default function Header() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authReason, setAuthReason] = useState<'general' | 'dashboard' | 'pricing'>('general');

  const isLoggedIn = status === 'authenticated' && !!session?.user;

  const handleOpenAuth = (reason: 'general' | 'dashboard' | 'pricing') => {
    setAuthReason(reason);
    setIsAuthModalOpen(true);
  };

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

            {/* Center / Navigation Links */}
            <div className="hidden md:flex items-center gap-6 text-xs font-bold text-[var(--color-text-secondary)]">
              <Link href="/" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-dark)]" />
                <span>OCR Converter</span>
              </Link>

              {/* Pricing & Credits: If not logged in, prompt login instead of routing to admin */}
              {isLoggedIn ? (
                <Link href="/pricing" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[var(--media-violet)]" />
                  <span>Pricing &amp; Credits</span>
                </Link>
              ) : (
                <button
                  onClick={() => handleOpenAuth('pricing')}
                  className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-[var(--media-violet)]" />
                  <span>Pricing &amp; Credits</span>
                </button>
              )}

              {/* Dashboard: If not logged in, prompt login instead of routing to admin */}
              {isLoggedIn ? (
                <Link href="/dashboard" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-[var(--color-ink)]" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <button
                  onClick={() => handleOpenAuth('dashboard')}
                  className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BarChart3 className="w-3.5 h-3.5 text-[var(--color-ink)]" />
                  <span>Dashboard</span>
                </button>
              )}

              {/* SuperAdmin Link */}
              <Link href="/superadmin" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5 text-[var(--color-brand-hover)]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-brand)] animate-pulse" />
                <span>SuperAdmin</span>
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

      {/* Auth Modal for Guest Header Actions */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason={authReason}
      />
    </>
  );
}
