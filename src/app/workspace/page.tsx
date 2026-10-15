import type { Metadata } from 'next';
import OcrWorkspace from '@/components/ocr/OcrWorkspace';

export const metadata: Metadata = {
  title: 'OCR Studio & Convert',
  robots: { index: false, follow: false },
};

export default function WorkspacePage() {
  return (
    <div className="w-full space-y-8 pb-16">
      <header className="space-y-1.5">
        <h1 className="type-title">OCR Studio &amp; Convert</h1>
        <p className="text-[15px] text-[var(--color-text-secondary)]">
          Upload bank statements, invoices, or receipts and export to Excel, CSV, QBO, OFX, or QIF.
        </p>
      </header>

      <div>
        <OcrWorkspace />
      </div>
    </div>
  );
}
