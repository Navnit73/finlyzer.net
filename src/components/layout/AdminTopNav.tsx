'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Home,
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
    if (pathname === '/') {
      return [
        { label: 'Workspace', href: '/' },
        { label: 'OCR Studio & Convert', href: '/' },
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
    return [
      { label: 'Workspace', href: '/' },
      { label: 'Dashboard', href: pathname },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 sm:px-6 flex items-center justify-between transition-colors select-none">
        {/* Left: Sidebar Collapse/Mobile Toggles + Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Hamburger */}
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-surface-subtle)] text-[var(--color-ink)] border border-[var(--color-border)] cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Desktop Sidebar Collapse Toggle */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-lg hover:bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] border border-[var(--color-border)] transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Dynamic Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs truncate" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" />
                  )}
                  {isLast ? (
                    <span className="font-black text-[var(--color-ink)] truncate max-w-[180px] sm:max-w-xs">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors truncate"
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
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Engine Status Badge */}
          <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] font-bold text-[11px] border border-[var(--color-brand)]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-dark)] animate-pulse"></span>
            AI Engine Active
          </span>

          {/* History Drawer Trigger */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="btn btn-ghost btn-sm text-xs font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-subtle)] rounded-lg px-2.5 py-1.5 hidden md:flex items-center gap-1.5 border border-[var(--color-border)] cursor-pointer"
            title="View Document History"
          >
            <History className="w-3.5 h-3.5 text-[var(--color-ink)]" />
            <span>History</span>
          </button>

          {/* Pricing Quick Link */}
          <Link
            href="/pricing"
            className="btn btn-sm rounded-lg bg-[var(--color-brand-soft)] hover:bg-[var(--color-brand)] text-[var(--color-on-brand)] text-xs font-bold flex items-center gap-1.5 border border-[var(--color-brand)]/30 px-3 transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-[var(--color-ink)]" />
            <span className="hidden sm:inline">Pricing & Credits</span>
            <span className="sm:hidden">Credits</span>
          </Link>

          {/* User Account Dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-[var(--color-surface-subtle)] cursor-pointer transition-colors border border-[var(--color-border)]"
              aria-label="User profile menu"
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={28}
                  height={28}
                  unoptimized
                  className="w-7 h-7 rounded-md object-cover ring-1 ring-[var(--color-brand)]"
                />
              ) : (
                <div className="w-7 h-7 rounded-md bg-[var(--color-brand)] text-[var(--color-on-brand)] font-bold flex items-center justify-center text-xs">
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="text-xs font-bold text-[var(--color-ink)] hidden md:inline max-w-[100px] truncate">
                {session?.user?.name?.split(' ')[0] || 'Account'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-secondary)]" />
            </div>

            <ul
              tabIndex={0}
              className="dropdown-content z-50 menu p-2.5 shadow-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg w-56 text-xs space-y-1 mt-2"
            >
              <li className="p-2 border-b border-[var(--color-border)] pb-2.5 mb-1">
                <p className="font-bold text-[var(--color-ink)] text-xs truncate">{session?.user?.name}</p>
                <p className="text-[10px] text-[var(--color-text-muted)] font-mono truncate">{session?.user?.email}</p>
              </li>

              <li>
                <Link
                  href="/"
                  className="py-2 flex items-center gap-2 font-medium hover:bg-[var(--color-surface-subtle)] rounded-lg"
                >
                  <Sparkles className="w-4 h-4 text-[var(--color-brand-dark)]" />
                  <span>OCR Converter</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard"
                  className="py-2 flex items-center gap-2 font-medium hover:bg-[var(--color-surface-subtle)] rounded-lg"
                >
                  <BarChart3 className="w-4 h-4 text-[var(--color-ink)]" />
                  <span>Admin Dashboard</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/documents"
                  className="py-2 flex items-center gap-2 font-medium hover:bg-[var(--color-surface-subtle)] rounded-lg"
                >
                  <FileText className="w-4 h-4 text-[var(--media-blue)]" />
                  <span>Converted Documents</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/pricing"
                  className="py-2 flex items-center gap-2 font-medium hover:bg-[var(--color-surface-subtle)] rounded-lg"
                >
                  <CreditCard className="w-4 h-4 text-[var(--media-violet)]" />
                  <span>Buy Credits ($10 - $100)</span>
                </Link>
              </li>

              <li>
                <Link
                  href="/invoices"
                  className="py-2 flex items-center gap-2 font-medium hover:bg-[var(--color-surface-subtle)] rounded-lg"
                >
                  <Receipt className="w-4 h-4 text-[var(--media-pink)]" />
                  <span>Invoices & Billing</span>
                </Link>
              </li>

              <li>
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="py-2 flex items-center gap-2 font-medium hover:bg-[var(--color-surface-subtle)] rounded-lg w-full text-left cursor-pointer"
                >
                  <History className="w-4 h-4 text-[var(--color-ink)]" />
                  <span>Document History</span>
                </button>
              </li>

              <li className="pt-1 border-t border-[var(--color-border)]">
                <button
                  onClick={() => signOut()}
                  className="py-2 flex items-center gap-2 font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] rounded-lg w-full text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
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
