'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminTopNav from './AdminTopNav';

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Remember the desktop collapse preference across reloads.
  useEffect(() => {
    try {
      if (localStorage.getItem('finlyzer_sidebar_collapsed') === 'true') setIsCollapsed(true);
    } catch {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      try {
        localStorage.setItem('finlyzer_sidebar_collapsed', String(!prev));
      } catch {}
      return !prev;
    });
  };

  // Lock body scroll and listen for Escape key when mobile sidebar drawer is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileSidebarOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileSidebarOpen]);

  return (
    <div className="min-h-screen flex bg-[var(--color-surface)] text-[var(--color-ink)]">
      {/* Desktop Fixed Sidebar */}
      <div
        className={`hidden lg:block fixed inset-y-0 left-0 z-40 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <AdminSidebar isCollapsed={isCollapsed} />
      </div>

      {/* Mobile Slide-Over Drawer */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Sidebar"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative z-10 w-72 max-w-[85vw] h-full bg-[var(--color-surface)] shadow-2xl animate-slide-right flex flex-col">
            <AdminSidebar
              isCollapsed={false}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <AdminTopNav
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 bg-[var(--color-surface)] max-w-[1600px] w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
