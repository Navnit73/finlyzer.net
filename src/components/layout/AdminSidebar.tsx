'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import {
  TrendingUp,
  Sparkles,
  BarChart3,
  FileText,
  CreditCard,
  Receipt,
  LogOut,
  Zap,
  Plus,
  Layers,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
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
      title: 'WORKSPACE',
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
          name: 'Document Vault',
          shortName: 'Vault',
          href: '/documents',
          icon: FileText,
          active: pathname === '/documents' || pathname.startsWith('/document/'),
        },
      ],
    },
    {
      title: 'BILLING & ORDERS',
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
      title: 'SYSTEM & OPS',
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

  return (
    <aside
      className={`h-full bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col justify-between select-none transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding & Navigation */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className={`h-16 flex items-center border-b border-[var(--color-border)] px-4 shrink-0 ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}>
          <BrandLogo
            size="md"
            href="/dashboard"
            showText={!isCollapsed}
            tag={isAdmin ? 'Admin' : undefined}
            onClick={onCloseMobile}
            textClassName="!text-lg"
          />

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Convert Button */}
        <div className="p-3 border-b border-[var(--color-border)]">
          <Link
            href="/workspace"
            onClick={onCloseMobile}
            className={`btn-brand-primary !min-h-[38px] !h-[38px] !text-xs font-bold flex items-center justify-center gap-2 shadow-xs rounded-lg ${
              isCollapsed ? 'w-full !px-0' : 'w-full'
            }`}
            title="New Document OCR"
          >
            <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
            {!isCollapsed && <span>New Document OCR</span>}
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="py-4 px-2 space-y-5 overflow-y-auto flex-1 min-h-0">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {isCollapsed ? (
                idx > 0 && <div className="mx-3 mb-2 border-t border-[var(--color-border)]" aria-hidden="true" />
              ) : (
                <p className="px-3 pb-0.5 text-[10px] font-black tracking-wider uppercase text-[var(--color-text-muted)]">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.name : undefined}
                      aria-label={isCollapsed ? item.name : undefined}
                      aria-current={item.active ? 'page' : undefined}
                      className={`flex items-center h-9 rounded-lg text-xs font-semibold transition-colors ${
                        isCollapsed
                          ? 'justify-center w-full'
                          : 'justify-between gap-2 px-3'
                      } ${
                        item.active
                          ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)] font-bold shadow-xs'
                          : 'text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]'
                      }`}
                    >
                      <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
                        <Icon className={`w-4 h-4 shrink-0 ${
                          item.active ? 'text-[var(--color-on-brand)]' : 'text-[var(--color-text-secondary)]'
                        }`} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className={`shrink-0 whitespace-nowrap text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          item.active
                            ? 'bg-[var(--color-surface)] text-[var(--color-on-brand)]'
                            : 'bg-[var(--color-brand-soft)] text-[var(--color-on-brand)]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Quota & User Profile */}
      <div className="p-3 border-t border-[var(--color-border)] space-y-3 bg-[var(--color-surface-subtle)]">
        {/* Quota Widget */}
        {isCollapsed ? (
          <Link
            href="/pricing"
            onClick={onCloseMobile}
            className="flex flex-col items-center justify-center p-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors text-center"
            title={`${creditLabel} Pages Remaining (Click to Top Up)`}
          >
            <Zap className="w-4 h-4 text-[var(--color-brand-dark)]" />
            <span className="font-mono font-black text-[10px] text-[var(--color-ink)] mt-0.5">
              {creditLabel}p
            </span>
          </Link>
        ) : (
          <div className="p-3 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[var(--color-ink)]">
                <Zap className="w-3.5 h-3.5 text-[var(--color-brand-dark)]" />
                <span>Credit Balance</span>
              </div>
              <span className="font-mono font-bold text-[var(--color-ink)]">
                {creditLabel} Pages
              </span>
            </div>

            <div className="w-full bg-[var(--color-border)] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[var(--color-brand)] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${creditPercent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[var(--color-text-secondary)] pt-0.5">
              <span>{(quota?.tier ?? 'free').toUpperCase()} Tier</span>
              <Link
                href="/pricing"
                onClick={onCloseMobile}
                className="text-[var(--color-ink)] font-bold hover:underline flex items-center gap-0.5"
              >
                <span>Top Up</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}

        {/* User Card */}
        <div className={`flex items-center gap-2 ${isCollapsed ? 'flex-col justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={32}
                height={32}
                unoptimized
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-[var(--color-brand)] shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-[var(--color-brand)] text-[var(--color-on-brand)] font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
            )}
            {!isCollapsed && (
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-[var(--color-ink)] truncate leading-tight">
                  {session?.user?.name || 'My Account'}
                </p>
                <p className="text-[10px] text-[var(--color-text-secondary)] truncate font-mono">
                  {session?.user?.email}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={async () => {
              try {
                localStorage.removeItem('has_logged_in');
              } catch {}
              await signOut({ callbackUrl: '/' });
            }}
            className="p-1.5 shrink-0 rounded-lg text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors cursor-pointer"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
