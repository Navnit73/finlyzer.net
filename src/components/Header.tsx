'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Menu, X, ShieldCheck, ChevronRight, User } from 'lucide-react';
import UserMenu from './auth/UserMenu';
import AuthModal from './auth/LazyAuthModal';
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

/**
 * The single public-site header. AppShell renders it on every public page (and on shared pages
 * for guests); signed-in users get AdminShell instead, so this never switches its links by auth.
 */
export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState<string | undefined>(undefined);

  const handleLoginPrompt = React.useCallback((next: string | null) => {
    setLoginRedirect(next ?? undefined);
    setIsAuthModalOpen(true);
  }, []);

  // Automatically close mobile menu on page navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background scroll and handle Escape key when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const guestLinks = [
    { href: '/convert', label: 'All Bank Converters', active: pathname.startsWith('/convert') },
    { href: '/reconcile/bank-reconciliation-tool', label: 'Bank Reconciliation', active: pathname.startsWith('/reconcile') },
    { href: '/analyzer/bank-statement-analyzer', label: 'Statement Analyzer', active: pathname.startsWith('/analyzer') },
    { href: '/calculators/cash-flow-calculator', label: 'Cash Flow Calculator', active: pathname.startsWith('/calculators') },
    { href: '/pricing', label: 'Pricing', active: pathname === '/pricing' },
  ];

  const desktopLinkClass = (active: boolean) =>
    `inline-flex items-center h-11 px-1 text-sm transition-colors ${
      active ? 'text-[var(--color-ink)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-ink)]'
    }`;

  // Mobile menu rows: large, quiet, hairline-separated, 52px+ tall.
  const mobileRowClass =
    'flex items-center justify-between gap-4 min-h-[52px] py-3 border-b border-[var(--color-border)] text-[var(--color-ink)] transition-colors hover:text-[var(--color-brand-dark)]';

  const mobileGuestLinks = [
    { href: '/', label: 'Home' },
    { href: '/convert', label: 'All Bank Converters Hub', hint: 'By bank & export format' },
    { href: '/reconcile/bank-reconciliation-tool', label: 'Bank Reconciliation', hint: 'Match your statement to your ledger' },
    { href: '/analyzer/bank-statement-analyzer', label: 'Statement Analyzer', hint: 'See where your money went' },
    { href: '/calculators/cash-flow-calculator', label: 'Cash Flow Calculator', hint: 'Net, operating & free cash flow' },
    { href: '/pricing', label: 'Pricing & Credit Plans', hint: 'Free tier & Pay-as-you-go' },
  ];

  return (
    <>
      {/* Global frosted header. The blur lives on an inner layer so the fixed mobile
          menu below is positioned against the viewport, not the blurred element. */}
      <header className="sticky top-0 z-40 w-full">
        <div className="surface-frosted hairline-b">
          <div className="site-container">
            <nav className="flex items-center justify-between h-[var(--nav-height)] gap-6" aria-label="Main Navigation">
              {/* Brand Logo */}
              <div className="flex items-center shrink-0">
                <BrandLogo size="sm" textClassName="!text-[19px]" priority />
              </div>

              {/* Center navigation links (desktop) */}
              <div className="hidden md:flex items-center gap-7 lg:gap-9">
                {guestLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={link.active ? 'page' : undefined}
                    className={desktopLinkClass(link.active)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Account Actions, User Menu & Mobile Hamburger Button */}
              <div className="flex items-center gap-1 sm:gap-3 shrink-0">
                <UserMenu />

                {/* Hamburger Button (Mobile Only) */}
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden -mr-2 w-11 h-11 rounded-full text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)] cursor-pointer transition-colors flex items-center justify-center"
                  aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-navigation-menu"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-navigation-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
            className="md:hidden fixed inset-x-0 top-[var(--nav-height)] bottom-0 z-50 bg-[var(--color-surface)] overflow-y-auto overscroll-contain animate-fade-in"
          >
            <div className="site-container pt-4 pb-10">
              <div className="space-y-10">
                <ul>
                  {mobileGuestLinks.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} onClick={() => setIsMobileMenuOpen(false)} className={mobileRowClass}>
                        <span className="min-w-0">
                          <span className="block text-[19px] font-semibold tracking-[-0.015em]">{link.label}</span>
                          {link.hint && (
                            <span className="block mt-0.5 text-[13px] text-[var(--color-text-muted)]">{link.hint}</span>
                          )}
                        </span>
                        <ChevronRight className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Popular bank converters */}
                <div>
                  <p className="text-[13px] text-[var(--color-text-muted)]">Popular Converters</p>
                  <ul className="mt-2 grid grid-cols-2 gap-x-6">
                    {[
                      { name: 'Chase to Excel', slug: 'chase-bank-statement-to-excel' },
                      { name: 'Bank of America', slug: 'bank-of-america-statement-to-excel' },
                      { name: 'Wells Fargo to Excel', slug: 'wells-fargo-bank-statement-to-excel' },
                      { name: 'Barclays Statement', slug: 'barclays-bank-statement-to-excel' },
                      { name: 'HSBC Statement', slug: 'hsbc-bank-statement-to-excel' },
                      { name: 'CommBank Statement', slug: 'commbank-statement-to-excel' },
                    ].map((bank) => (
                      <li key={bank.slug}>
                        <Link
                          href={`/convert/${bank.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center min-h-[44px] py-2 border-b border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors"
                        >
                          <span className="truncate">{bank.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Free tier note + sign in */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 mt-0.5 text-[var(--color-success)] shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-[15px] font-semibold text-[var(--color-ink)]">100% Free For 1–10 Pages</p>
                      <p className="text-[13px] text-[var(--color-text-secondary)]">No credit card or registration required.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="btn-brand-primary w-full !min-h-[50px] !text-[17px] cursor-pointer"
                  >
                    <User className="w-4 h-4" aria-hidden="true" />
                    <span>Sign In with Google</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

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
