'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import UserAvatar from '@/components/auth/UserAvatar';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Menu,
  Zap,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sparkles,
  BarChart3,
  CreditCard,
  Receipt,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
} from 'lucide-react';
import HistoryDrawer from '../ocr/HistoryDrawer';

interface AdminTopNavProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onToggleMobileSidebar: () => void;
}

export default function AdminTopNav({
  isCollapsed = false,
  onToggleCollapse,
  onToggleMobileSidebar,
}: AdminTopNavProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Generate dynamic breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    if (pathname === '/workspace') {
      return [
        { label: 'Workspace', href: '/dashboard' },
        { label: 'OCR Studio & Convert', href: '/workspace' },
      ];
    }
    if (pathname === '/dashboard') {
      return [
        { label: 'Workspace', href: '/dashboard' },
        { label: 'Dashboard Overview', href: '/dashboard' },
      ];
    }
    if (pathname === '/documents') {
      return [
        { label: 'Workspace', href: '/dashboard' },
        { label: 'Converted Documents', href: '/documents' },
      ];
    }
    if (pathname.startsWith('/document/')) {
      const docId = pathname.replace('/document/', '');
      return [
        { label: 'Workspace', href: '/dashboard' },
        { label: 'Converted Documents', href: '/documents' },
        { label: `Document (${docId.substring(0, 10)}...)`, href: pathname },
      ];
    }
    if (pathname === '/pricing') {
      return [
        { label: 'Billing', href: '/pricing' },
        { label: 'Pricing & Credit Packages', href: '/pricing' },
      ];
    }
    if (pathname === '/invoices') {
      return [
        { label: 'Billing', href: '/invoices' },
        { label: 'Invoices & Receipts', href: '/invoices' },
      ];
    }
    if (pathname === '/superadmin' || pathname === '/admin') {
      return [
        { label: 'System & Ops', href: '/superadmin' },
        { label: 'SuperAdmin Monitoring', href: pathname },
      ];
    }
    return [
      { label: 'Workspace', href: '/dashboard' },
      { label: 'Dashboard Overview', href: '/dashboard' },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  const menuItemClass = 'flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-sm text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] active:bg-[var(--color-surface-muted)] w-full text-left cursor-pointer';
  const menuIconClass = 'w-4 h-4 text-[var(--color-text-secondary)]';

  return (
    <>
      <header className="sticky top-0 z-30 h-[52px] surface-frosted hairline-b px-3 sm:px-6 gap-2 flex items-center justify-between select-none">
        {/* Left: Sidebar Collapse/Mobile Toggles + Breadcrumbs */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          {/* Mobile Hamburger */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden shrink-0 -ml-1 w-11 h-11 inline-flex items-center justify-center rounded-full hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)] cursor-pointer transition-colors"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.75} aria-hidden="true" />
          </button>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden lg:inline-flex -ml-2 w-8 h-8 items-center justify-center rounded-md hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.75} aria-hidden="true" />
              )}
            </button>
          )}

          {/* Dynamic Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm min-w-0" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <ChevronRight className="hidden sm:block w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" aria-hidden="true" />
                  )}
                  {isLast ? (
                    <span aria-current="page" className="font-medium text-[var(--color-ink)] truncate min-w-0 sm:max-w-xs">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="hidden sm:inline text-[var(--color-text-muted)] hover:text-[var(--color-ink)] transition-colors truncate shrink-0"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Right: Quick Actions & Profile Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Engine Status */}
          <span className="hidden xl:inline-flex items-center gap-1.5 px-2 text-xs text-[var(--color-text-muted)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" aria-hidden="true"></span>
            AI Engine Active
          </span>

          {/* History Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] transition-colors cursor-pointer"
            title="View Document History"
            aria-label="View Document History"
          >
            <History className="w-4 h-4 text-[var(--color-text-secondary)]" strokeWidth={1.75} aria-hidden="true" />
            <span>History</span>
          </button>

          {/* Pricing Quick Link */}
          <Link
            href="/pricing"
            className="btn-brand-primary !min-h-8 !h-8 !px-3 sm:!px-3.5 !text-[13px] !gap-1.5"
            aria-label="Pricing and credits"
          >
            <Zap className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
            <span className="hidden sm:inline">Pricing &amp; Credits</span>
          </Link>

          {/* User Account Dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="flex items-center gap-1.5 h-11 sm:h-9 pl-1 pr-1 md:pr-2 rounded-full hover:bg-[var(--color-surface-subtle)] cursor-pointer transition-colors"
              aria-label="User profile menu"
              aria-haspopup="menu"
            >
              <UserAvatar
                src={session?.user?.image}
                name={session?.user?.name}
                size={28}
                imageClassName="w-7 h-7 rounded-full object-cover ring-1 ring-[var(--color-border)]"
                fallbackClassName="w-7 h-7 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-ink)] font-medium flex items-center justify-center text-xs"
              />
              <span className="text-[13px] font-medium text-[var(--color-ink)] hidden md:inline max-w-[100px] truncate">
                {session?.user?.name?.split(' ')[0] || 'Account'}
              </span>
              <ChevronDown className="hidden md:block w-3.5 h-3.5 text-[var(--color-text-muted)]" aria-hidden="true" />
            </div>

            <ul
              tabIndex={0}
              onClick={() => (document.activeElement as HTMLElement | null)?.blur()}
              className="dropdown-content surface-overlay z-50 p-1.5 w-64 mt-2"
            >
              <li className="px-2.5 pt-2 pb-2.5 mb-1 border-b border-[var(--color-border-subtle)]">
                <p className="font-medium text-[var(--color-ink)] text-sm truncate">{session?.user?.name}</p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{session?.user?.email}</p>
              </li>

              <li>
                <Link href="/workspace" className={menuItemClass}>
                  <Sparkles className={menuIconClass} strokeWidth={1.75} aria-hidden="true" />
                  <span>OCR Studio & Convert</span>
                </Link>
              </li>

              <li>
                <Link href="/dashboard" className={menuItemClass}>
                  <BarChart3 className={menuIconClass} strokeWidth={1.75} aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>
              </li>

              <li>
                <Link href="/documents" className={menuItemClass}>
                  <FileText className={menuIconClass} strokeWidth={1.75} aria-hidden="true" />
                  <span>Converted Documents</span>
                </Link>
              </li>

              <li>
                <Link href="/pricing" className={menuItemClass}>
                  <CreditCard className={menuIconClass} strokeWidth={1.75} aria-hidden="true" />
                  <span>Buy Credits ($10 - $100)</span>
                </Link>
              </li>

              <li>
                <Link href="/invoices" className={menuItemClass}>
                  <Receipt className={menuIconClass} strokeWidth={1.75} aria-hidden="true" />
                  <span>Invoices & Billing</span>
                </Link>
              </li>

              <li>
                <button type="button" onClick={() => setIsHistoryOpen(true)} className={menuItemClass}>
                  <History className={menuIconClass} strokeWidth={1.75} aria-hidden="true" />
                  <span>Document History</span>
                </button>
              </li>

              <li className="mt-1 pt-1 border-t border-[var(--color-border-subtle)]">
                <button
                  type="button"
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
        </div>
      </header>

      {/* History Drawer */}
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
