'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import UserAvatar from '@/components/auth/UserAvatar';
import {
  Sparkles,
  BarChart3,
  FileText,
  CreditCard,
  Receipt,
  LogOut,
  Zap,
  Plus,
  ShieldCheck,
  GitCompareArrows,
  X,
} from 'lucide-react';
import BrandLogo from '../BrandLogo';

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  onOpenCheckout?: () => void;
}

export default function AdminSidebar({
  isCollapsed = false,
  onCloseMobile,
  onOpenCheckout,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = !!session?.user?.isAdmin;
  // null until the first fetch, so we never flash a fake "10 Pages" balance.
  const [quota, setQuota] = useState<{
    tier: string;
    freePagesRemaining: number;
    purchasedPages?: number;
    totalAvailablePages?: number;
    totalPagesProcessed: number;
  } | null>(null);

  useEffect(() => {
    async function loadQuota() {
      try {
        const res = await fetch('/api/user/quota');
        if (res.ok) {
          const data = await res.json();
          setQuota(data);
        }
      } catch (err) {
        console.warn('Failed to load quota in sidebar:', err);
      }
    }

    loadQuota();

    window.addEventListener('finlyzer:quota_updated', loadQuota);
    window.addEventListener('focus', loadQuota);
    return () => {
      window.removeEventListener('finlyzer:quota_updated', loadQuota);
      window.removeEventListener('focus', loadQuota);
    };
    // Re-fetch on navigation: finishing a conversion routes to /document/[id] without a quota event.
  }, [pathname]);

  const navSections = [
    {
      title: 'Workspace',
      items: [
        {
          name: 'Dashboard',
          shortName: 'Dashboard',
          href: '/dashboard',
          icon: BarChart3,
          active: pathname === '/dashboard',
        },
        {
          name: 'OCR Studio & Convert',
          shortName: 'Convert',
          href: '/workspace',
          icon: Sparkles,
          active: pathname === '/workspace',
          badge: 'AI',
        },
        {
          name: 'Bank Reconciliation',
          shortName: 'Reconcile',
          href: '/reconciliations',
          icon: GitCompareArrows,
          active: pathname === '/reconciliations' || pathname.startsWith('/reconciliation/'),
        },
        {
          name: 'Document Vault',
          shortName: 'Vault',
          href: '/documents',
          icon: FileText,
          active: pathname === '/documents' || pathname.startsWith('/document/'),
        },
      ],
    },
    {
      title: 'Billing & orders',
      items: [
        {
          name: 'Buy Credits',
          shortName: 'Buy Credits',
          href: '/pricing',
          icon: CreditCard,
          active: pathname === '/pricing',
        },
        {
          name: 'Invoices & Orders',
          shortName: 'Invoices',
          href: '/invoices',
          icon: Receipt,
          active: pathname === '/invoices',
        },
      ],
    },
    ...(isAdmin ? [{
      title: 'System & ops',
      items: [
        {
          name: 'SuperAdmin',
          shortName: 'SuperAdmin',
          href: '/superadmin',
          icon: ShieldCheck,
          active: pathname === '/superadmin' || pathname === '/admin',
          badge: 'Live',
        },
      ],
    }] : []),
  ];

  // `freePagesRemaining` from /api/user/quota is the total remaining balance (free + purchased − used).
  const totalCredits = quota?.freePagesRemaining ?? 0;
  const totalAllowance = quota?.totalAvailablePages || 0;
  const creditPercent = totalAllowance > 0 ? Math.min(100, (totalCredits / totalAllowance) * 100) : 0;
  const creditLabel = quota ? totalCredits.toLocaleString() : '—';
  const tierLabel = quota?.tier ?? 'free';

  // In the mobile drawer every target is at least 44px tall.
  const isDrawer = !!onCloseMobile;
  const itemHeight = isDrawer ? 'h-11' : 'h-9';

  return (
    <aside
      className={`h-full bg-[var(--color-surface-subtle)] border-r border-[var(--color-border)] flex flex-col justify-between select-none transition-[width] duration-300 ease-[var(--ease-apple)] ${
        isCollapsed ? 'w-20' : isDrawer ? 'w-full' : 'w-64'
      }`}
    >
      {/* Top Branding & Navigation */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className={`h-[52px] flex items-center px-4 shrink-0 ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          <BrandLogo
            size={28}
            href="/dashboard"
            showText={!isCollapsed}
            tag={isAdmin ? 'Admin' : undefined}
            onClick={onCloseMobile}
            textClassName="!text-[17px]"
          />

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden -mr-2 w-11 h-11 inline-flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Quick Convert Button */}
        <div className="px-3 pt-2 pb-3">
          <Link
            href="/workspace"
            onClick={onCloseMobile}
            className={`btn-brand-primary w-full !text-sm ${isDrawer ? '' : '!min-h-9 !h-9'} ${isCollapsed ? '!px-0' : '!px-4'}`}
            title="New Document OCR"
            aria-label={isCollapsed ? 'New Document OCR' : undefined}
          >
            <Plus className="w-4 h-4 shrink-0" strokeWidth={2.25} aria-hidden="true" />
            {!isCollapsed && <span>New Document OCR</span>}
          </Link>
        </div>

        {/* Navigation Sections */}
        <nav aria-label="App navigation" className="pb-4 px-3 space-y-5 overflow-y-auto flex-1 min-h-0">
          {navSections.map((section, idx) => (
            <div key={section.title} className="space-y-0.5">
              {isCollapsed ? (
                idx > 0 && <div className="mx-2 mb-2 border-t border-[var(--color-border)]" aria-hidden="true" />
              ) : (
                <p className="px-3 pb-1 text-xs font-medium text-[var(--color-text-muted)]">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        title={isCollapsed ? item.name : undefined}
                        aria-label={isCollapsed ? item.name : undefined}
                        aria-current={item.active ? 'page' : undefined}
                        className={`group flex items-center ${itemHeight} rounded-lg text-sm transition-colors duration-150 ${
                          isCollapsed ? 'justify-center w-full' : 'justify-between gap-2 px-3'
                        } ${
                          item.active
                            ? 'bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)] font-medium'
                            : 'text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]'
                        }`}
                      >
                        <span className={`flex items-center gap-3 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
                          <Icon
                            className={`w-[18px] h-[18px] shrink-0 ${
                              item.active ? 'text-[var(--color-brand-dark)]' : 'text-[var(--color-text-secondary)]'
                            }`}
                            strokeWidth={1.75}
                            aria-hidden="true"
                          />
                          {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </span>

                        {!isCollapsed && item.badge && (
                          <span className={`shrink-0 whitespace-nowrap text-[11px] font-medium leading-none px-1.5 py-1 rounded-full ${
                            item.active
                              ? 'bg-[var(--color-surface)] text-[var(--color-brand-dark)]'
                              : 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Quota & User Profile */}
      <div className="px-3 pt-3 pb-3 border-t border-[var(--color-border)] space-y-3">
        {/* Quota Widget */}
        {isCollapsed ? (
          <Link
            href="/pricing"
            onClick={onCloseMobile}
            className="flex flex-col items-center justify-center py-2 rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors text-center"
            title={`${creditLabel} Pages Remaining (Click to Top Up)`}
            aria-label={`${creditLabel} pages remaining. Top up credits`}
          >
            <Zap className="w-[18px] h-[18px] text-[var(--color-text-secondary)]" strokeWidth={1.75} aria-hidden="true" />
            <span className="tabular-nums font-medium text-[11px] text-[var(--color-ink)] mt-1">
              {creditLabel}p
            </span>
          </Link>
        ) : (
          <div className="px-3 space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[13px] text-[var(--color-text-secondary)]">Credit balance</span>
              <span className="text-[13px] font-medium tabular-nums text-[var(--color-ink)]">
                {creditLabel} pages
              </span>
            </div>

            <div
              role="progressbar"
              aria-valuenow={Math.round(creditPercent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Remaining page credit quota"
              className="w-full bg-[var(--color-surface-muted)] rounded-full h-1 overflow-hidden"
            >
              <div
                className="bg-[var(--color-brand)] h-1 rounded-full transition-[width] duration-300"
                style={{ width: `${creditPercent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <span className="capitalize">{tierLabel} tier</span>
              <Link
                href="/pricing"
                onClick={onCloseMobile}
                className={`link font-medium inline-flex items-center ${isDrawer ? 'min-h-11 px-1 -mr-1' : ''}`}
              >
                Top up
              </Link>
            </div>
          </div>
        )}

        {/* User Card */}
        <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col justify-center' : 'justify-between pl-3'}`}>
          <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
            <UserAvatar
              src={session?.user?.image}
              name={session?.user?.name}
              size={32}
              imageClassName="w-8 h-8 rounded-full object-cover ring-1 ring-[var(--color-border)] shrink-0"
              fallbackClassName="w-8 h-8 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink)] font-medium flex items-center justify-center text-[13px] shrink-0"
            />
            {!isCollapsed && (
              <div className="min-w-0 text-left">
                <p className="text-[13px] font-medium text-[var(--color-ink)] truncate leading-tight">
                  {session?.user?.name || 'My Account'}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                localStorage.removeItem('has_logged_in');
              } catch {}
              await signOut({ callbackUrl: '/' });
            }}
            className={`${isDrawer ? 'w-11 h-11' : 'w-9 h-9'} shrink-0 inline-flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors cursor-pointer`}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
}
