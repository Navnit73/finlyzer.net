import Link from "next/link";
import { TrendingUp, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border-t border-[var(--color-border)] py-8 sm:py-12 mt-auto">
      <div className="site-container">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-black text-[var(--color-ink)] hover:opacity-90 transition-opacity"
              aria-label="Finlyzer Home"
            >
              <span className="w-7 h-7 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-on-brand)] shadow-xs">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </span>
              <span>Finlyzer</span>
            </Link>
            <span className="hidden sm:inline text-[var(--color-border)]">&bull;</span>
            <p className="text-xs text-[var(--color-text-secondary)]">
              AI-Powered Financial Statement Extraction &amp; Modeling Hub
            </p>
          </div>

          {/* Privacy & Security Note */}
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--color-brand-hover)]" />
              <span>SSL Encrypted &bull; Private &amp; Secure</span>
            </div>
            <span>&copy; {new Date().getFullYear()} Finlyzer. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

