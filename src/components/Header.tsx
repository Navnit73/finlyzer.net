import Link from "next/link";
import { ChevronDown, TrendingUp } from "lucide-react";

export default function Header() {
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
              Finlyzer AI 2.0 is live: Instant 10-K deep dives &amp; multi-scenario DCF models.
            </span>
            <a
              href="#demo"
              className="underline hover:text-[var(--color-brand)] transition-colors ml-1 hidden sm:inline"
            >
              Try the interactive model &rarr;
            </a>
          </div>
        </div>
      </div>

      {/* 2. Global Sticky Header with DaisyUI Navbar */}
      <header className="sticky top-0 z-50 bg-[var(--color-surface)]/95 backdrop-blur-md border-b border-[var(--color-border)]">
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
                  <li className="menu-title text-[var(--color-text-muted)]">Valuation Tools</li>
                  <li><a href="#features">Automated DCF Builder</a></li>
                  <li><a href="#features">Comparable Multiples</a></li>
                  <li><a href="#features">SEC 10-K Copilot</a></li>
                  <li className="menu-title text-[var(--color-text-muted)] mt-2">Hub &amp; Plans</li>
                  <li><a href="#hub">Financial Tools Hub</a></li>
                  <li><a href="#hub">Enterprise</a></li>
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
                <li className="dropdown dropdown-hover">
                  <div tabIndex={0} role="button" className="flex items-center gap-1 hover:bg-transparent hover:text-[var(--color-brand-hover)] py-2">
                    Valuation Tools <ChevronDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
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
                        Comparable Company Analysis
                      </a>
                    </li>
                    <li>
                      <a href="#features" className="py-2.5 font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl">
                        WACC &amp; Cost of Capital Calc
                      </a>
                    </li>
                    <li>
                      <a href="#hub" className="py-2.5 font-medium hover:bg-[var(--color-surface-subtle)] rounded-xl">
                        LBO &amp; M&amp;A Scenarios
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a href="#features" className="hover:bg-transparent hover:text-[var(--color-brand-hover)]">
                    Financial Hub
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:bg-transparent hover:text-[var(--color-brand-hover)]">
                    SEC 10-K Copilot
                  </a>
                </li>
                <li>
                  <a href="#hub" className="hover:bg-transparent hover:text-[var(--color-brand-hover)]">
                    Enterprise
                  </a>
                </li>
                <li>
                  <a href="#hub" className="hover:bg-transparent hover:text-[var(--color-brand-hover)]">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            {/* Account Actions */}
            <div className="navbar-end gap-3 sm:gap-4">
              <a
                href="#login"
                className="btn btn-ghost btn-sm text-[15px] font-medium text-[var(--color-ink)] hover:bg-transparent hover:text-[var(--color-text-secondary)]"
              >
                Login
              </a>
              <a
                href="#signup"
                className="btn-brand-dark"
              >
                Sign Up Free
              </a>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
