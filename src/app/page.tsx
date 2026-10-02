import Link from "next/link";

import OcrWorkspace from "@/components/ocr/OcrWorkspace";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-surface)]">
    

      {/* Main Clean Workspace Hero Section */}
      <div className="site-container py-8 sm:py-12 space-y-8">
      

        {/* The Reusable OCR Studio Component */}
        <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] p-4 sm:p-8 shadow-xs">
          <OcrWorkspace />
        </div>
      </div>
    </main>
  );
}
