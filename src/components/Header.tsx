'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { ChevronDown, TrendingUp, Sparkles } from "lucide-react";
import UserMenu from "./auth/UserMenu";
import HistoryDrawer from "./ocr/HistoryDrawer";

export default function Header() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
      {/* 1. Thin Promotional Announcement Bar (design.md Section 5) */}
      <div className="bg-[var(--color-ink)] text-white text-xs sm:text-sm py-2 px-4">
        <div className="site-container flex items-center justify-between">
          <div className="flex-1 text-center font-medium flex items-center justify-center gap-2">
            <span className="badge badge-sm bg-[var(--color-brand)] text-[var(--color-on-brand)] font-bold border-none">
              NEW
            </span>
            <span>
              AI OCR Advance 2.0 is live: Extract 200-page bank statements, P&amp;L reports &amp; Excel master sheets.
            </span>
            <a
              href="#ocr-studio"
              className="underline hover:text-[var(--color-brand)] transition-colors ml-1 hidden sm:inline"
            >
              Try Live OCR Studio &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* 2. Global Sticky Header with DaisyUI Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="site-container">
          <div className="navbar p-0 h-20">
            <div className="navbar-start gap-3">
              {/* Mobile Drawer / Dropdown */}
              <div className="dropdown lg:hidden">
                <button
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle btn-sm"
                  aria-label="Open navigation menu"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h8m-8 6h16"
                    />
                  </svg>
                </button>
                <ul
                  tabIndex={0}
                  className="menu menu-sm dropdown-content bg-[var(--color-surface)] rounded-box z-50 mt-3 w-64 p-3 shadow-xl border border-[var(--color-border)]"
                >
                  <li className="menu-title text-[var(--color-text-muted)]">OCR &amp; Valuation Tools</li>
                  <li><a href="#ocr-studio">AI OCR Statement Extractor</a></li>
                  <li><a href="#ocr-studio">Batch Processing</a></li>
                  <li><a href="#features">Automated DCF Builder</a></li>
                  <li><a href="#features">Comparable Multiples</a></li>
                  <li className="menu-title text-[var(--color-text-muted)] mt-2">Hub &amp; Plans</li>
                  <li><a href="#hub">Financial Tools Hub</a></li>
                  <li><a href="#hub">Pricing</a></li>
                </ul>
              </div>

              {/* Brand Logo */}
              <Link href="/" className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-[var(--color-ink)]">
                <span className="w-8 h-8 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-on-brand)] shadow-sm">
                  <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                </span>
                <span>
                  Fin<span className="text-[var(--color-ink)]">lyzer</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1 font-medium gap-1 text-[15px]">
                <li>
                  <a href="#ocr-studio" className="hover:bg-transparent hover:text-[var(--color-brand-hover)] flex items-center gap-1.5 font-bold text-[var(--color-ink)]">
                    <Sparkles className="w-4 h-4 text-[var(--color-brand-hover)]" />
                    <span>AI OCR Studio</span>
                  </a>
                </li>
                <li className="dropdown dropdown-hover">
                  <div tabIndex={0} role="button" className="flex items-center gap-1 hover:bg-transparent hover:text-[var(--color-brand-hover)] py-2">
                    Valuation Suite <ChevronDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-50 menu p-2 shadow-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl w-64 text-sm"
                  >
                    <li>
                      <a href="#features" className="py-2.5 font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl">
                        Automated DCF Builder
                      </a>
                    </li>
                    <li>
                      <a href="#features" className="py-2.5 font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl">
                        Comparable Company Comps
                      </a>
                    </li>
                    <li>
                      <a href="#features" className="py-2.5 font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl">
                        SEC 10-K AI Copilot
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a href="#hub" className="hover:bg-transparent hover:text-[var(--color-brand-hover)]">
                    Tools Hub
                  </a>
                </li>
                <li>
                  <a href="#hub" className="hover:bg-transparent hover:text-[var(--color-brand-hover)]">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Account Actions & User Menu */}
            <div className="navbar-end gap-3 sm:gap-4">
              <UserMenu onOpenHistory={() => setIsHistoryOpen(true)} />
            </div>
          </div>
        </div>
      </header>

      {/* Global History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectDocument={() => {
          setIsHistoryOpen(false);
          // scroll to ocr studio
          const el = document.getElementById('ocr-studio');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </>
  );
}
