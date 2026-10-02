import OcrWorkspace from "@/components/ocr/OcrWorkspace";

export default function Home() {
  return (
    <div className="w-full py-2 sm:py-4">
      <div className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 sm:p-8 shadow-none">
        <OcrWorkspace />
      </div>
    </div>
  );
}

