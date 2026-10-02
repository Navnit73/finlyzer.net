import OcrWorkspace from "@/components/ocr/OcrWorkspace";

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-surface)]">
      {/* Main Clean Workspace Hero Section */}
      <div className="site-container py-4 sm:py-10">
        {/* The Reusable OCR Studio Component */}
        <div className="bg-transparent sm:bg-[var(--color-surface)] sm:rounded-3xl sm:border sm:border-[var(--color-border)] p-0 sm:p-8 sm:shadow-xs">
          <OcrWorkspace />
        </div>
      </div>
    </main>
  );
}

