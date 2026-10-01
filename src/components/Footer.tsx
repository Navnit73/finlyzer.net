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

          <div className="space-y-3 text-sm flex flex-col">
            <h6 className="footer-title opacity-100 text-[var(--color-ink)] font-bold mb-0">Valuation Tools</h6>
            <a href="#features" className="link link-hover">DCF Valuation</a>
            <a href="#features" className="link link-hover">Comps Analysis</a>
            <a href="#features" className="link link-hover">WACC Calculator</a>
            <a href="#hub" className="link link-hover">LBO Model</a>
          </div>

          <div className="space-y-3 text-sm flex flex-col">
            <h6 className="footer-title opacity-100 text-[var(--color-ink)] font-bold mb-0">Financial Hub</h6>
            <a href="#features" className="link link-hover">SEC 10-K Copilot</a>
            <a href="#hub" className="link link-hover">Monte Carlo Risk</a>
            <a href="#hub" className="link link-hover">Dividend Forecast</a>
            <a href="#demo" className="link link-hover">Excel Add-in</a>
          </div>

          <div className="space-y-3 text-sm flex flex-col">
            <h6 className="footer-title opacity-100 text-[var(--color-ink)] font-bold mb-0">Company</h6>
            <a href="#" className="link link-hover">About Us</a>
            <a href="#" className="link link-hover">Security &amp; SOC2</a>
            <a href="#" className="link link-hover">Privacy Policy</a>
            <a href="#" className="link link-hover">Terms of Service</a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
          <p>&copy; {new Date().getFullYear()} Finlyzer Inc. All rights reserved.</p>
          <p>Financial data provided for research &amp; analytical modeling purposes.</p>
        </div>
      </div>
    </footer>
  );
}
