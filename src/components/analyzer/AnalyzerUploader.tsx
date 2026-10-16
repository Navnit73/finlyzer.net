'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import OcrUploader from '@/components/ocr/OcrUploader';
import type { AnalyzerDefinition } from '@/lib/analyzers';
import type { ExtractionResponse } from '@/types/ocr';

/**
 * Upload card for an analyzer. Reuses the converter's OCR upload flow (config popup,
 * password handling, guest/page-limit rules) and sends the result to /analysis/[id].
 */
export default function AnalyzerUploader({ analyzer }: { analyzer: AnalyzerDefinition }) {
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);

  const handleComplete = (data: ExtractionResponse) => {
    if (data?.id) router.push(`/analysis/${data.id}`);
  };

  return (
    <div className="space-y-3">
      <OcrUploader
        defaultDocumentType={analyzer.documentType}
        onExtractionComplete={handleComplete}
        onOpenBatchModal={() => setNotice('Analyze one statement at a time. Drop a single file to continue.')}
      />
      {notice && (
        <p role="status" className="type-caption text-[var(--color-text-secondary)] text-center">
          {notice}
        </p>
      )}
    </div>
  );
}
