import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer footer-horizontal p-10 sm:p-14 bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border-t border-[var(--color-border)]">
      <div className="site-container w-full p-0">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-[var(--color-border)] w-full">
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-[var(--color-ink)]">
              <span className="w-7 h-7 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-on-brand)]">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </span>
              <span>Finlyzer</span>
            </Link>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
              Next-generation financial tool hub for automated DCF modeling, AI SEC filing investigation, and equity research.
            </p>
          </div>

         
        </div>


      </div>
    </footer>
  );
}
