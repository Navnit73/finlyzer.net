'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, History, ChevronDown, User, CreditCard, ShieldAlert } from 'lucide-react';
import UserAvatar from '@/components/auth/UserAvatar';
import AuthModal from './AuthModal';

interface UserMenuProps {
  onOpenHistory?: () => void;
}

export default function UserMenu({ onOpenHistory }: UserMenuProps) {
  const { data: session, status } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [quota, setQuota] = useState<{
    tier: string;
    freePagesRemaining: number;
    totalPagesProcessed: number;
  }>({
    tier: 'free',
    freePagesRemaining: 10,
    totalPagesProcessed: 0,
  });

  useEffect(() => {
    async function fetchQuota() {
      try {
        const res = await fetch('/api/user/quota');
        if (res.ok) {
          const data = await res.json();
          setQuota(data);
        }
      } catch (e) {
        console.warn('Quota fetch failed:', e);
      }
    }
    fetchQuota();

    const handleUpdate = () => {
      fetchQuota();
    };

    window.addEventListener('finlyzer:quota_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('finlyzer:quota_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [session]);

  const isLoggedIn = status === 'authenticated' && !!session?.user;

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Document History Trigger Button */}
        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-[13px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
            title="View Stored Documents & History"
            aria-label="View Document History"
          >
            <History className="w-4 h-4 text-[var(--color-text-secondary)]" strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden sm:inline">History</span>
          </button>
        )}

        {isLoggedIn ? (
          /* Logged In Dropdown */
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              aria-label="User account menu"
              aria-haspopup="menu"
              className="flex items-center gap-1.5 h-11 sm:h-9 pl-1 pr-1 sm:pr-2 rounded-full hover:bg-[var(--color-surface-subtle)] cursor-pointer transition-colors"
            >
              <UserAvatar
                src={session.user?.image}
                name={session.user?.name}
                size={28}
                imageClassName="w-7 h-7 rounded-full object-cover ring-1 ring-[var(--color-border)]"
                fallbackClassName="w-7 h-7 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink)] font-medium flex items-center justify-center text-xs"
              />
              <span className="text-[13px] font-medium text-[var(--color-ink)] hidden sm:inline max-w-[120px] truncate">
                {session.user?.name?.split(' ')[0] || 'Account'}
              </span>
              <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-[var(--color-text-muted)]" aria-hidden="true" />
            </div>

            <ul
              tabIndex={0}
              role="menu"
              className="dropdown-content surface-overlay z-50 p-1.5 w-72 mt-2"
            >
              {/* Profile Header */}
              <li role="none" className="px-2.5 pt-2 pb-3 mb-1 border-b border-[var(--color-border-subtle)]">
                <p className="font-medium text-[var(--color-ink)] text-sm truncate">{session.user?.name}</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{session.user?.email}</p>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full px-2 py-0.5 bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] font-medium capitalize text-xs">
                    {quota.tier} Plan
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)] tabular-nums">
                    {`${quota.freePagesRemaining.toLocaleString()} Pages Remaining`}
                  </span>
                </div>
              </li>

              {/* Dashboard & Credits Link */}
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] w-full text-left cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-[var(--color-text-secondary)]" strokeWidth={1.75} aria-hidden="true" />
                  <span>Dashboard & Credits</span>
                </Link>
              </li>

              {/* SuperAdmin System Operations Link */}
              <li>
                <Link
                  href="/superadmin"
                  className="flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] w-full text-left cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-[var(--color-text-secondary)]" strokeWidth={1.75} aria-hidden="true" />
                  <span>SuperAdmin Operations</span>
                </Link>
              </li>

              {onOpenHistory && (
                <li>
                  <button
                    onClick={onOpenHistory}
                    className="flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] w-full text-left cursor-pointer"
                  >
                    <History className="w-4 h-4 text-[var(--color-text-secondary)]" strokeWidth={1.75} aria-hidden="true" />
                    <span>My Document History</span>
                  </button>
                </li>
              )}

              <li className="mt-1 pt-1 border-t border-[var(--color-border-subtle)]">
                <button
                  onClick={async () => {
                    try {
                      localStorage.removeItem('has_logged_in');
                    } catch {}
                    await signOut({ callbackUrl: '/' });
                  }}
                  className="flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] w-full text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </li>
            </ul>
          </div>
        ) : (
          /* Single Clean Sign In CTA across all viewports */
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 10-Page Quota Pill on Desktop */}
            <div className="hidden md:flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] text-xs font-medium">
              <span>10 Free Pages</span>
            </div>

            {/* Exactly ONE Sign In Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-brand-primary !min-h-9 !h-9 !px-4 !text-sm !gap-1.5"
              aria-label="Sign In with Google"
            >
              <User className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
              <span>Sign In</span>
            </button>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        reason="general"
      />
    </>
  );
}

