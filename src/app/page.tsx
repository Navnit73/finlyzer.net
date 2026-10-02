import Link from "next/link";
import { Sparkles, ShieldCheck, Zap, Lock, FileSpreadsheet } from "lucide-react";
import OcrWorkspace from "@/components/ocr/OcrWorkspace";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-surface)]">
      {/* Clean Top Context Bar */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] py-3">
        <div className="site-container flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Breadcrumb Navigation */}
          <div className="breadcrumbs p-0 text-[var(--color-text-secondary)]">
            <ul>
              <li>
                <Link href="/" className="hover:text-[var(--color-ink)] font-medium">
                  Finlyzer
                </Link>
              </li>
              <li className="text-[var(--color-ink)] font-bold">AI OCR Statement Studio</li>
            </ul>
          </div>

          {/* Quick Badges */}
          <div className="flex items-center gap-3 text-[var(--color-text-muted)] font-medium">
            <span className="flex items-center gap-1.5 text-[var(--color-ink)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-brand-hover)]" />
              <span>DeepSeek AI Reconciliation</span>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>10 Pages Free</span>
            </span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="hidden sm:flex items-center gap-1.5 text-[var(--color-brand-hover)]">
              <Lock className="w-3 h-3" />
              <span>Password PDF Support</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Clean Workspace Hero Section */}
      <div className="site-container py-8 sm:py-12 space-y-8">
        {/* Title Header */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-soft)] text-[var(--color-on-brand)] text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-[var(--color-brand-hover)]" />
            <span>AI FINANCIAL OCR &bull; ADVANCE 2.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[var(--color-ink)] tracking-tight leading-[1.08]">
            AI Financial Statement &amp; OCR Studio
          </h1>

          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed">
            Extract bank statements, tax invoices, and scanned receipts into audited Excel spreadsheets, QuickBooks (.QBO), and Xero (.OFX). Automatically reconciles line-item transactions with zero balance discrepancies.
          </p>
        </div>

        {/* The Reusable OCR Studio Component */}
        <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-4 sm:p-8 shadow-xs">
          <OcrWorkspace />
        </div>
      </div>
    </main>
  );
}
