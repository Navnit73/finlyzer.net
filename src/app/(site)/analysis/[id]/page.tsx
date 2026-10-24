'use client';

import React, { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import AnalysisReport from '@/components/analyzer/AnalysisReport';
import { analyzeStatement } from '@/lib/spending-analysis';
import { ANALYZERS, analyzerPath } from '@/lib/analyzers';
import type { ExtractionResponse } from '@/types/ocr';

interface AnalysisPageProps {
  params: Promise<{ id: string }>;
}

type Loaded = Pick<ExtractionResponse, 'extraction' | 'filename'>;

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const { id } = use(params);
  const [doc, setDoc] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // Instant render from the upload's sessionStorage cache, then refresh from the API.
    try {
      const cached = sessionStorage.getItem('doc_' + id);
      if (cached) {
        const parsed = JSON.parse(cached) as Loaded;
        if (parsed?.extraction) setDoc(parsed);
      }
    } catch {
      // Fall through to the network fetch.
    }

    fetch(`/api/documents/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || 'This analysis was not found or has expired.');
        }
        return res.json();
      })
      .then((data) => {
        if (active) {
          setDoc({ extraction: data.extraction || {}, filename: data.filename });
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) setError((err as Error).message || 'Could not load this analysis.');
      });

    return () => {
      active = false;
    };
  }, [id]);

  const analysis = useMemo(() => (doc ? analyzeStatement(doc) : null), [doc]);
  const backHref = analyzerPath(ANALYZERS[0].slug);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-12">
      <Link href={backHref} className="link inline-flex items-center gap-1.5 min-h-[44px] text-[15px]">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Analyze another statement
      </Link>

      {analysis ? (
        <AnalysisReport analysis={analysis} filename={doc?.filename} />
      ) : error ? (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[var(--color-danger-border)] bg-[var(--color-danger-soft)] p-5 text-[var(--color-danger)]">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <p className="type-body">{error}</p>
        </div>
      ) : (
        <div className="space-y-4" aria-busy="true" aria-live="polite">
          <div className="skeleton-line h-4 w-48" />
          <div className="skeleton-line h-14 w-80" />
          <div className="skeleton-line h-64 w-full" />
          <span className="sr-only">Loading your analysis</span>
        </div>
      )}
    </div>
  );
}
