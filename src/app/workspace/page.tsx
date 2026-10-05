import type { Metadata } from 'next';
import OcrWorkspace from '@/components/ocr/OcrWorkspace';

export const metadata: Metadata = {
  title: 'OCR Studio & Convert',
  robots: { index: false, follow: false },
};

export default function WorkspacePage() {
  return (
    <div className="w-full space-y-6 pb-16">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tracking-tight">
          OCR Studio &amp; Convert
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
          Upload bank statements, invoices, or receipts and export to Excel, CSV, QBO, OFX, or QIF.
        </p>
      </div>

      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 sm:p-6">
        <OcrWorkspace />
      </div>
    </div>
  );
}
