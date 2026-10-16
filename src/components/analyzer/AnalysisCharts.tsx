'use client';

import React, { useMemo, useState } from 'react';
import { formatMoney, formatShortDate, type CategoryId, type DayTotal } from '@/lib/spending-analysis';

/* -------------------------------------------------------------------------- */
/* Spending over time                                                         */
/* -------------------------------------------------------------------------- */

interface Bucket {
  key: string;
  label: string;
  total: number;
  parts: { id: CategoryId; label: string; color: string; amount: number }[];
}

function weekStart(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7)); // Monday
  return dt.toISOString().slice(0, 10);
}

/** Days for short statements, weeks for long ones, so bars stay readable on a phone. */
function toBuckets(days: DayTotal[]): { buckets: Bucket[]; weekly: boolean } {
  const span = days.length ? (Date.parse(days[days.length - 1].date) - Date.parse(days[0].date)) / 86_400_000 + 1 : 0;
  const weekly = span > 45;
  const map = new Map<string, Bucket>();
  for (const day of days) {
    const key = weekly ? weekStart(day.date) : day.date;
    const b = map.get(key) ?? {
      key,
      label: weekly ? `Week of ${formatShortDate(key)}` : formatShortDate(key),
      total: 0,
      parts: [],
    };
    b.total += day.total;
    for (const p of day.byCategory) {
      const existing = b.parts.find((x) => x.id === p.id);
      if (existing) existing.amount += p.amount;
      else b.parts.push({ ...p });
    }
    map.set(key, b);
  }
  const buckets = [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  buckets.forEach((b) => b.parts.sort((x, y) => y.amount - x.amount));
  return { buckets, weekly };
}

/**
 * Stacked bars you can tap, drag across or step through with the arrow keys.
 * The selected bar's numbers appear in a panel underneath (no floating tooltip, so it works on touch).
 */
export function SpendingTimeline({ days, currency }: { days: DayTotal[]; currency: string }) {
  const { buckets, weekly } = useMemo(() => toBuckets(days), [days]);
  const peak = useMemo(() => buckets.reduce((best, b, i) => (b.total > buckets[best].total ? i : best), 0), [buckets]);
  const [picked, setPicked] = useState<number | null>(null);

  if (buckets.length === 0) {
    return <p className="type-body text-[var(--color-text-muted)]">No dated spending to chart.</p>;
  }

  const index = Math.min(picked ?? peak, buckets.length - 1);
  const selected = buckets[index];
  const max = Math.max(1, ...buckets.map((b) => b.total));

  const pickFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.floor(((e.clientX - rect.left) / rect.width) * buckets.length);
    setPicked(Math.max(0, Math.min(buckets.length - 1, i)));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPicked(Math.max(0, index - 1));
    else if (e.key === 'ArrowRight') setPicked(Math.min(buckets.length - 1, index + 1));
    else return;
    e.preventDefault();
  };

  return (
    <div>
      <div
        role="group"
        tabIndex={0}
        aria-label={`${weekly ? 'Weekly' : 'Daily'} spending. Use left and right arrow keys to move between bars.`}
        onPointerDown={pickFromPointer}
        onPointerMove={(e) => e.buttons === 1 || e.pointerType === 'mouse' ? pickFromPointer(e) : undefined}
        onKeyDown={onKey}
        className="flex items-end gap-[2px] sm:gap-1 h-48 sm:h-60 border-b border-[var(--color-border)] cursor-pointer touch-pan-y select-none rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
      >
        {buckets.map((b, i) => (
          <div key={b.key} className="flex-1 min-w-[2px] h-full flex items-end">
            <div
              className={`w-full flex flex-col-reverse gap-px rounded-t-[3px] overflow-hidden transition-opacity ${
                i === index ? 'opacity-100' : 'opacity-45'
              }`}
              style={{ height: `${Math.max(2, (b.total / max) * 100)}%` }}
            >
              {b.parts.map((p) => (
                <span key={p.id} className="block w-full" style={{ height: `${(p.amount / b.total) * 100}%`, background: p.color }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between type-caption">
        <span>{buckets[0].label.replace('Week of ', '')}</span>
        <span>{weekly ? 'Each bar is one week' : 'Each bar is one day'}</span>
        <span>{buckets[buckets.length - 1].label.replace('Week of ', '')}</span>
      </div>

      <div className="mt-4 rounded-2xl bg-[var(--color-surface-subtle)] p-4 sm:p-5" aria-live="polite">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[15px] font-medium text-[var(--color-ink)]">
            {selected.label}
            {index === peak && <span className="ml-2 type-caption">Highest</span>}
          </p>
          <p className="text-[19px] font-semibold tracking-tight tabular-nums text-[var(--color-ink)]">
            {formatMoney(selected.total, currency)}
          </p>
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
          {selected.parts.slice(0, 4).map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-[14px] text-[var(--color-text-secondary)]">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} aria-hidden="true" />
              {p.label} <span className="font-medium tabular-nums text-[var(--color-ink)]">{formatMoney(p.amount, currency)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small shared bars                                                          */
/* -------------------------------------------------------------------------- */

/** One horizontal bar split into coloured segments (shares must sum to ~1). */
export function SegmentedBar({
  segments,
  label,
  className = 'h-3',
}: {
  segments: { key: string; share: number; color: string }[];
  label: string;
  className?: string;
}) {
  return (
    <div role="img" aria-label={label} className={`flex w-full gap-[2px] overflow-hidden rounded-full bg-[var(--color-surface-muted)] ${className}`}>
      {segments
        .filter((s) => s.share > 0)
        .map((s) => (
          <span key={s.key} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${s.share * 100}%`, background: s.color }} />
        ))}
    </div>
  );
}
