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
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onCloseMobile?: () => void;
  onOpenCheckout?: () => void;
}

export default function AdminSidebar({
  isCollapsed = false,
  onToggleCollapse,
  onCloseMobile,
  onOpenCheckout,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [quota, setQuota] = useState<{
    tier: string;
    freePagesRemaining: number;
    purchasedPages?: number;
    totalAvailablePages?: number;
    totalPagesProcessed: number;
  }>({
    tier: 'free',
    freePagesRemaining: 10,
    purchasedPages: 0,
    totalAvailablePages: 10,
    totalPagesProcessed: 0,
  });

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

    const handleUpdate = () => {
      loadQuota();
    };

    window.addEventListener('finlyzer:quota_updated', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('finlyzer:quota_updated', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [pathname]);

  const navSections = [
    {
      title: 'WORKSPACE',
      items: [
        {
          name: 'Dashboard Overview',
          shortName: 'Dashboard',
          href: '/dashboard',
          icon: BarChart3,
          active: pathname === '/dashboard',
        },
        {
          name: 'OCR Studio & Convert',
          shortName: 'Convert',
          href: '/',
          icon: Sparkles,
          active: pathname === '/',
          badge: 'AI',
        },
        {
          name: 'Converted Documents',
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
          name: 'Credit Packages ($10 - $100)',
          shortName: 'Buy Credits',
          href: '/pricing',
          icon: CreditCard,
          active: pathname === '/pricing',
          badge: 'Top Up',
        },
        {
          name: 'Invoices & Orders',
          shortName: 'Invoices',
          href: '/invoices',
          icon: Receipt,
          active: pathname === '/invoices',
          badge: 'PDF',
        },
      ],
    },
  ];

  const totalCredits = quota.tier === 'enterprise' ? 99999 : (quota.freePagesRemaining ?? 10);

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
          <Link
            href="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 text-lg font-black tracking-tight text-[var(--color-ink)] hover:opacity-90 transition-opacity"
            title="Finlyzer Admin"
          >
            <span className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-on-brand)] shadow-xs shrink-0">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </span>
            {!isCollapsed && (
              <span className="flex items-center truncate">
                Fin<span className="text-[var(--color-ink)]">lyzer</span>
                <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] rounded-md">
                  Admin
                </span>
              </span>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          {onToggleCollapse && !onCloseMobile && (
            <button
              onClick={onToggleCollapse}
              className={`hidden lg:flex p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer ${
                isCollapsed ? 'mt-0' : ''
              }`}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}

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
            href="/"
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
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-black tracking-wider uppercase text-[var(--color-text-muted)]">
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
                      title={item.name}
                      className={`flex items-center rounded-lg text-xs font-semibold transition-all ${
                        isCollapsed
                          ? 'justify-center p-2.5 h-10 w-full'
                          : 'justify-between px-3 py-2'
                      } ${
                        item.active
                          ? 'bg-[var(--color-brand)] text-[var(--color-on-brand)] font-bold shadow-xs'
                          : 'text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)]'
                      }`}
                    >
                      <div className={`flex items-center gap-2.5 ${isCollapsed ? 'justify-center' : 'truncate'}`}>
                        <Icon className={`w-4 h-4 shrink-0 ${
                          item.active ? 'text-[var(--color-on-brand)]' : 'text-[var(--color-text-secondary)]'
                        }`} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>

                      {!isCollapsed && item.badge && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                          item.active
                            ? 'bg-black/20 text-[var(--color-on-brand)]'
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
            title={`${totalCredits} Pages Remaining (Click to Top Up)`}
          >
            <Zap className="w-4 h-4 text-[var(--color-brand-dark)]" />
            <span className="font-mono font-black text-[10px] text-[var(--color-ink)] mt-0.5">
              {totalCredits}p
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
                {totalCredits} Pages
              </span>
            </div>

            <div className="w-full bg-[var(--color-border)] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[var(--color-brand)] h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(10, (totalCredits / (quota.totalAvailablePages || 10)) * 100))}%`,
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-[var(--color-text-secondary)] pt-0.5">
              <span>{quota.tier.toUpperCase()} Tier</span>
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
        <div className={`flex items-center gap-2 pt-1 ${isCollapsed ? 'flex-col justify-center' : 'justify-between'}`}>
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
            className="p-1.5 rounded-lg text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors cursor-pointer"
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
