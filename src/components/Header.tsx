'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ChevronDown, TrendingUp, Sparkles } from "lucide-react";
import UserMenu from "./auth/UserMenu";
import HistoryDrawer from "./ocr/HistoryDrawer";

export default function Header() {
  const router = useRouter();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <>
    

      {/* 2. Global Sticky Header with DaisyUI Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="site-container">
          <div className="navbar p-0 h-20">
            <div className="navbar-start gap-3">
            

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
        onSelectDocument={(id) => {
          setIsHistoryOpen(false);
          router.push(`/document/${id}`);
        }}
      />
    </>
  );
}
