'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  TrendingUp,
  Sparkles,
  CreditCard,
  BarChart3,
  Menu,
  X,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  ChevronRight,
  FolderLock,
  Receipt,
  User,
  Zap,
} from 'lucide-react';
import UserMenu from './auth/UserMenu';
import HistoryDrawer from './ocr/HistoryDrawer';
import AuthModal from './auth/AuthModal';
import BrandLogo from './BrandLogo';
import { sanitizeNextPath } from '@/lib/routes';

// src/proxy.ts sends guests who open an app page to `/?login=1&next=<path>`.
// Read that in its own Suspense boundary so the public pages stay statically rendered.
function LoginPromptReader({ onPrompt }: { onPrompt: (next: string | null) => void }) {
  const searchParams = useSearchParams();
  const wantsLogin = searchParams.get('login') === '1';
  const next = sanitizeNextPath(searchParams.get('next'));
  useEffect(() => {
    if (wantsLogin) onPrompt(next);
  }, [wantsLogin, next, onPrompt]);
  return null;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState<string | undefined>(undefined);

  const isLoggedIn = status === 'authenticated' && !!session?.user;
  const isAdmin = !!session?.user?.isAdmin;

  const handleLoginPrompt = React.useCallback((next: string | null) => {
    setLoginRedirect(next ?? undefined);
    setIsAuthModalOpen(true);
  }, []);

  // Automatically close mobile menu on page navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Global Flat Header */}
      <header className="sticky top-0 z-40 w-full bg-[var(--color-surface)] border-b border-[var(--color-border)] transition-colors">
        <div className="site-container">
          <nav className="flex items-center justify-between h-16 sm:h-20" aria-label="Main Navigation">
            {/* Brand Logo */}
            <div className="flex items-center">
              <BrandLogo size="lg" priority />
            </div>

            {/* Center / Navigation Links (Guest Desktop) */}
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

            {/* Center / Navigation Links (Authenticated Desktop) */}
            {isLoggedIn && (
              <div className="hidden md:flex items-center gap-6 text-xs font-bold text-[var(--color-text-secondary)]">
                <Link href="/dashboard" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-[var(--color-ink)]" />
                  <span>Dashboard</span>
                </Link>

                <Link href="/workspace" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-hover)]" />
                  <span>OCR Studio</span>
                </Link>

                <Link href="/documents" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <FolderLock className="w-3.5 h-3.5 text-[var(--media-blue)]" />
                  <span>Document Vault</span>
                </Link>

                <Link href="/invoices" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-[var(--media-pink)]" />
                  <span>Invoices</span>
                </Link>

                <Link href="/pricing" className="hover:text-[var(--color-ink)] transition-colors flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[var(--media-violet)]" />
                  <span>Pricing &amp; Credits</span>
                </Link>

                {/* SuperAdmin Link */}
                {isAdmin && (
                <Link href="/superadmin" className="hover:text-[var(--color-ink)] text-[var(--color-text-secondary)] transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-hover)]" />
                  <span>SuperAdmin</span>
                </Link>
                )}
              </div>
            )}

            {/* Account Actions, User Menu & Mobile Hamburger Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <UserMenu onOpenHistory={isLoggedIn ? () => setIsHistoryOpen(true) : undefined} />

              {/* Hamburger Button (Mobile Only) */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] border border-[var(--color-border)] cursor-pointer transition-colors flex items-center justify-center"
                aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Drawer / Slide-Down Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 sm:top-20 bottom-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="site-container py-6 space-y-6">
              {!isLoggedIn ? (
                /* Guest Mobile Navigation */
                <div className="space-y-6">
                  {/* Primary Nav Links */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text-muted)] px-3">
                      Navigation
                    </p>

                    <Link
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] text-[var(--color-ink)] font-bold text-sm transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-[var(--color-surface)] border border-[var(--color-border)] p-1 flex items-center justify-center">
                          <Image src="/logo.png" alt="Finlyzers Logo" width={24} height={24} className="w-full h-full object-contain" />
                        </div>
                        <span>Home &amp; Instant Extractor</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </Link>

                    <Link
                      href="/convert"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] text-[var(--color-ink)] font-bold text-sm transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] flex items-center justify-center">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <span>All Bank Converters Hub</span>
                          <p className="text-[11px] font-normal text-[var(--color-text-secondary)]">By bank &amp; export format</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </Link>

                    <Link
                      href="/pricing"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] hover:bg-[var(--color-surface-muted)] text-[var(--color-ink)] font-bold text-sm transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[var(--media-violet-soft)] text-[var(--media-violet-text)] flex items-center justify-center">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <span>Pricing &amp; Credit Plans</span>
                          <p className="text-[11px] font-normal text-[var(--color-text-secondary)]">Free tier &amp; Pay-as-you-go</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </Link>
                  </div>

                  {/* Popular Bank Converters Quick Grid */}
                  <div className="space-y-2.5">
                    <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text-muted)] px-3">
                      Popular Converters
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: 'Chase to Excel', slug: 'chase-bank-statement-to-excel' },
                        { name: 'Bank of America', slug: 'bank-of-america-statement-to-excel' },
                        { name: 'Wells Fargo to Excel', slug: 'wells-fargo-bank-statement-to-excel' },
                        { name: 'Barclays Statement', slug: 'barclays-bank-statement-to-excel' },
                        { name: 'Indian Banks (HDFC/SBI)', slug: 'indian-bank-statement-to-excel' },
                        { name: 'Scanned PDF OCR', slug: 'scanned-pdf-ocr-to-excel' },
                      ].map((bank) => (
                        <Link
                          key={bank.slug}
                          href={`/convert/${bank.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="p-3 rounded-xl bg-[var(--color-surface-subtle)]/70 hover:bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-ink)] transition-colors flex items-center justify-between"
                        >
                          <span className="truncate">{bank.name}</span>
                          <ChevronRight className="w-3 h-3 text-[var(--color-text-muted)] shrink-0 ml-1" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Free Tier Guarantee Banner */}
                  <div className="p-3.5 rounded-2xl bg-[var(--color-brand-soft)]/60 border border-[var(--color-brand)]/40 flex items-center gap-3 text-xs text-[var(--color-on-brand)]">
                    <ShieldCheck className="w-5 h-5 text-[var(--color-brand-hover)] shrink-0" />
                    <div>
                      <p className="font-black">100% Free For 1–10 Pages</p>
                      <p className="text-[11px] opacity-90">No credit card or registration required.</p>
                    </div>
                  </div>

                  {/* Sign In Trigger Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full btn-brand-primary !min-h-[46px] !h-[46px] text-sm font-black rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>Sign In with Google</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Authenticated Mobile Navigation */
                <div className="space-y-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-[var(--color-text-muted)] px-3">
                    Your Workspace
                  </p>
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] text-[var(--color-ink)] font-bold text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-4 h-4 text-[var(--color-ink)]" />
                        <span>Dashboard</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </Link>

                    <Link
                      href="/workspace"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] text-[var(--color-ink)] font-bold text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-[var(--color-brand-hover)]" />
                        <span>OCR Studio</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </Link>

                    <Link
                      href="/documents"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] text-[var(--color-ink)] font-bold text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <FolderLock className="w-4 h-4 text-[var(--media-blue-text)]" />
                        <span>Document Vault</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </Link>

                    <Link
                      href="/invoices"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] text-[var(--color-ink)] font-bold text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Receipt className="w-4 h-4 text-[var(--media-orange-text)]" />
                        <span>Invoices</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </Link>

                    <Link
                      href="/pricing"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] text-[var(--color-ink)] font-bold text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-[var(--media-violet)]" />
                        <span>Pricing &amp; Credits</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </Link>

                    {isAdmin && (
                    <Link
                      href="/superadmin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] text-[var(--color-ink)] font-bold text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[var(--color-brand-hover)]" />
                        <span>SuperAdmin Operations</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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

      <Suspense fallback={null}>
        <LoginPromptReader onPrompt={handleLoginPrompt} />
      </Suspense>

      {/* Guest Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="general"
        redirectUrl={loginRedirect}
      />
    </>
  );
}
