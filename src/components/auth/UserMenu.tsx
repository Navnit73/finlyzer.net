'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, History, ChevronDown, User } from 'lucide-react';
import Image from 'next/image';
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
  }, [session]);

  const isLoggedIn = status === 'authenticated' && !!session?.user;

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Document History Trigger Button */}
        {onOpenHistory && (
          <button
            onClick={onOpenHistory}
            className="btn btn-ghost btn-sm text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-[var(--color-border)]"
            title="View Stored Documents & History"
          >
            <History className="w-3.5 h-3.5 text-[var(--color-ink)]" />
            <span className="hidden md:inline">History</span>
          </button>
        )}

        {isLoggedIn ? (
          /* Logged In Dropdown */
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[var(--color-surface-subtle)] cursor-pointer transition-colors border border-[var(--color-border)]"
            >
              {session.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[var(--color-brand)]"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--color-brand)] text-[var(--color-on-brand)] font-bold flex items-center justify-center text-xs">
                  {session.user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-xs font-bold text-[var(--color-ink)] hidden sm:inline max-w-[120px] truncate">
                {session.user?.name?.split(' ')[0] || 'Account'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
            </div>

            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-3 shadow-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-64 text-xs space-y-1.5 mt-2"
            >
              {/* Profile Header */}
              <li className="p-2 border-b border-[var(--color-border)] pb-3">
                <p className="font-bold text-[var(--color-ink)] text-sm truncate">{session.user?.name}</p>
                <p className="text-[var(--color-text-muted)] truncate">{session.user?.email}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="badge badge-sm bg-[var(--color-brand)] text-[var(--color-on-brand)] font-bold border-none uppercase text-[10px]">
                    {quota.tier} Plan
                  </span>
                  <span className="text-[11px] text-[var(--color-text-secondary)]">
                    {quota.tier === 'pro' ? 'Unlimited' : `${quota.freePagesRemaining} Free Pages Left`}
                  </span>
                </div>
              </li>

              {onOpenHistory && (
                <li>
                  <button onClick={onOpenHistory} className="py-2 flex items-center gap-2 font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl">
                    <History className="w-4 h-4 text-[var(--color-ink)]" />
                    <span>My Document History</span>
                  </button>
                </li>
              )}

              <li>
                <button
                  onClick={() => signOut()}
                  className="py-2 flex items-center gap-2 font-semibold text-red-600 hover:bg-red-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </li>
            </ul>
          </div>
        ) : (
          /* Guest State: Quota Badge & Sign In Trigger */
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 10-Page Quota Pill */}
            <div className="hidden lg:flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] text-xs font-bold">
              <span>10 Free Pages</span>
            </div>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn btn-ghost btn-sm text-[14px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] rounded-full"
            >
              <User className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Sign In</span>
            </button>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-brand-dark !min-h-[40px] !py-0 !px-4 !text-xs sm:!text-sm"
            >
              Sign Up Free
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
