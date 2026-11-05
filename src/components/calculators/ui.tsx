'use client';

/**
 * Shared building blocks for the /calculators tools. Each calculator composes these into its own
 * layout; nothing here knows about a specific formula.
 */

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, Info, RotateCcw, TriangleAlert } from 'lucide-react';
import { CURRENCIES, CURRENCY_CODES, type CurrencyCode, formatMoney, toCsv } from '@/lib/calculators/money.ts';

const inputClass =
  'input h-11 w-full rounded-xl text-[15px] tabular-nums bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none aria-[invalid=true]:border-[var(--color-danger)]';

/* ------------------------------------------------------------------ layout */

/** Two-column calculator: inputs on the left, a sticky result panel on the right (stacked on mobile). */
export function CalculatorLayout({
  title,
  form,
  result,
  mobileSummary,
  children,
}: {
  /** Accessible name for the whole tool. */
  title: string;
  form: React.ReactNode;
  result: React.ReactNode;
  /** Headline figure pinned to the bottom of the screen on mobile while the form is in view. */
  mobileSummary?: { label: string; value: string } | null;
  /** Full-width content below both columns: charts, schedules. */
  children?: React.ReactNode;
}) {
  const id = useId();
  return (
    <section id="calculator" aria-labelledby={`${id}-title`} className="site-container scroll-mt-24">
      <h2 id={`${id}-title`} className="sr-only">
        {title}
      </h2>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
        <div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 sm:px-8 sm:py-8">{form}</div>
          {mobileSummary && (
            <a
              href={`#${id}-result`}
              className="lg:hidden sticky bottom-0 z-10 -mx-4 mt-4 px-4 py-3 surface-frosted border-t border-[var(--color-border)] flex items-center justify-between gap-3"
            >
              <span className="text-sm text-[var(--color-text-secondary)]">{mobileSummary.label}</span>
              <span className="text-[19px] font-semibold tabular-nums text-[var(--color-ink)]">{mobileSummary.value}</span>
            </a>
          )}
        </div>
        <aside id={`${id}-result`} aria-label="Result" className="scroll-mt-24 rounded-2xl bg-[var(--color-surface-subtle)] p-6 sm:p-8 space-y-6 lg:sticky lg:top-24">
          {result}
        </aside>
      </div>
      {children && <div className="mt-6 space-y-6">{children}</div>}
    </section>
  );
}

/** Top row of a form: optional heading on the left, controls (currency, reset) on the right. */
export function FormHeader({ title, children }: { title?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      {title ? <h3 className="type-headline">{title}</h3> : <span />}
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function FieldGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: 1 | 2 | 3 }) {
  const grid = cols === 1 ? '' : cols === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3';
  return <div className={`grid gap-5 ${grid}`}>{children}</div>;
}

/* ------------------------------------------------------------------ inputs */

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  hint?: string;
  /** Shown inside the field on the left, e.g. a currency symbol. */
  prefix?: string;
  /** Shown inside the field on the right, e.g. "%", "years". */
  suffix?: string;
  placeholder?: string;
  /** Adds a slider under the field; typing outside the range still works. */
  range?: { min: number; max: number; step: number };
  /** For integers (months, years, shares). */
  integer?: boolean;
  className?: string;
}

export function NumberField({ label, value, onChange, error, hint, prefix, suffix, placeholder, range, integer, className }: NumberFieldProps) {
  const id = useId();
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  const numeric = Number(String(value).replace(/,/g, ''));
  const sliderValue = range ? Math.min(range.max, Math.max(range.min, Number.isFinite(numeric) ? numeric : range.min)) : 0;

  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-ink)]">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 z-10 flex items-center text-[15px] text-[var(--color-text-muted)]" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          inputMode={integer ? 'numeric' : 'decimal'}
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass} ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-16' : ''}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-[var(--color-text-muted)]" aria-hidden="true">
            {suffix}
          </span>
        )}
      </div>
      {range && (
        <input
          type="range"
          min={range.min}
          max={range.max}
          step={range.step}
          value={sliderValue}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} slider`}
          className="range range-xs w-full [--range-fill:0] text-[var(--color-brand)]"
        />
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[13px] text-[var(--color-text-muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  hint?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-ink)]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="select h-11 w-full rounded-xl text-[15px] bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && (
        <p id={`${id}-hint`} className="text-[13px] text-[var(--color-text-muted)]">
          {hint}
        </p>
      )}
    </div>
  );
}

/** Compact currency picker for the form header. Formatting only; it never converts amounts. */
export function CurrencySelect({ value, onChange }: { value: CurrencyCode; onChange: (c: CurrencyCode) => void }) {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm text-[var(--color-text-secondary)]">
        Currency
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as CurrencyCode)}
        className="select select-sm h-9 rounded-full text-sm bg-[var(--color-surface)] border-[var(--color-border)] focus:border-[var(--color-brand)] focus:outline-none"
      >
        {CURRENCY_CODES.map((c) => (
          <option key={c} value={c}>
            {CURRENCIES[c].code}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Pill toggle between 2–4 options (e.g. years / months, monthly / yearly). */
export function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
  hideLabel,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  hideLabel?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <p id={id} className={hideLabel ? 'sr-only' : 'text-sm font-medium text-[var(--color-ink)]'}>
        {label}
      </p>
      <div role="radiogroup" aria-labelledby={id} className="inline-flex flex-wrap rounded-full bg-[var(--color-surface-subtle)] p-1">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`min-h-[36px] rounded-full px-4 text-sm font-medium transition-colors ${
                active
                  ? 'bg-[var(--color-surface)] text-[var(--color-ink)] border border-[var(--color-border)]'
                  : 'text-[var(--color-text-secondary)] border border-transparent hover:text-[var(--color-ink)]'
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ResetButton({ onClick, label = 'Reset to example' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className="btn btn-sm btn-ghost rounded-full gap-1.5 text-[var(--color-text-secondary)]">
      <RotateCcw className="w-4 h-4" aria-hidden="true" />
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ results */

/** The one number the calculator exists to produce. */
export function HeadlineResult({ label, value, caption }: { label: string; value: string; caption?: React.ReactNode }) {
  return (
    <div aria-live="polite">
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
      <p className="text-[clamp(2rem,6vw,2.5rem)] leading-tight font-semibold tracking-tight tabular-nums text-[var(--color-ink)] break-words">{value}</p>
      {caption && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{caption}</p>}
    </div>
  );
}

export interface ResultRow {
  label: string;
  value: string;
  /** Visually emphasise (totals). */
  strong?: boolean;
  /** Small colored key matching a chart series. */
  swatch?: string;
}

export function ResultList({ rows, divided }: { rows: ResultRow[]; divided?: boolean }) {
  return (
    <dl className={`space-y-3 text-[15px] ${divided ? 'pt-5 border-t border-[var(--color-border)]' : ''}`}>
      {rows.map((r) => (
        <div key={r.label} className="flex items-baseline justify-between gap-3">
          <dt className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            {r.swatch && <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.swatch }} aria-hidden="true" />}
            {r.label}
          </dt>
          <dd className={`tabular-nums text-right text-[var(--color-ink)] ${r.strong ? 'font-semibold' : ''}`}>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const NOTICE_TONES = {
  info: { box: 'bg-[var(--color-brand-soft)] border-[var(--color-info-border)]', icon: 'text-[var(--color-brand-dark)]', Icon: Info },
  success: { box: 'bg-[var(--color-success-soft)] border-[var(--color-success-border)]', icon: 'text-[var(--color-success)]', Icon: CheckCircle2 },
  warning: { box: 'bg-[var(--color-warning-soft)] border-[var(--color-warning-border)]', icon: 'text-[var(--color-warning)]', Icon: TriangleAlert },
  danger: { box: 'bg-[var(--color-danger-soft)] border-[var(--color-danger-border)]', icon: 'text-[var(--color-danger)]', Icon: AlertCircle },
} as const;

export function Notice({ tone = 'info', children }: { tone?: keyof typeof NOTICE_TONES; children: React.ReactNode }) {
  const t = NOTICE_TONES[tone];
  return (
    <div className={`p-4 rounded-2xl border flex items-start gap-3 ${t.box}`} role={tone === 'danger' ? 'alert' : undefined}>
      <t.Icon className={`w-5 h-5 mt-0.5 shrink-0 ${t.icon}`} aria-hidden="true" />
      <div className="text-sm text-[var(--color-ink)] leading-relaxed">{children}</div>
    </div>
  );
}

/** Shown in the result panel while inputs are invalid, instead of stale or NaN figures. */
export function EmptyResult({ message = 'Fix the highlighted fields to see your result.' }: { message?: string }) {
  return (
    <div className="py-6 text-center">
      <AlertCircle className="w-6 h-6 mx-auto text-[var(--color-text-muted)]" aria-hidden="true" />
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]" aria-live="polite">
        {message}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ charts */

/**
 * Chart series colors. Validated as a pair with the dataviz palette check (CVD ΔE 33.7);
 * orange is below 3:1 against the surface, so every chart ships a legend with values and a table.
 */
export const SERIES = {
  primary: 'var(--color-brand)',
  secondary: 'var(--media-orange)',
  muted: 'var(--color-text-muted)',
} as const;

/** One whole split into parts (principal vs interest). Legend carries the values. */
export function SplitBar({ parts, currency, label }: { parts: { label: string; value: number; color: string }[]; currency: CurrencyCode; label: string }) {
  const total = parts.reduce((t, p) => t + Math.max(0, p.value), 0);
  if (total <= 0) return null;
  return (
    <figure className="space-y-3">
      <figcaption className="sr-only">{label}</figcaption>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(', ')}>
        {parts.map((p) =>
          p.value > 0 ? <span key={p.label} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(p.value / total) * 100}%`, background: p.color }} /> : null,
        )}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-[var(--color-text-secondary)]">
        {parts.map((p) => (
          <li key={p.label} className="inline-flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: p.color }} aria-hidden="true" />
            {p.label} {Math.round((p.value / total) * 100)}% · {formatMoney(p.value, currency, { decimals: 0 })}
          </li>
        ))}
      </ul>
    </figure>
  );
}

export interface LineSeries {
  name: string;
  color: string;
  values: number[];
  /** Light area wash under the line. */
  area?: boolean;
}

/**
 * Line chart over a shared x axis (years, months). SVG, no library. Crosshair + tooltip on hover
 * and keyboard (arrow keys) so every value is reachable; the data table lives next to it.
 */
export function LineChart({
  title,
  xLabels,
  series,
  currency,
  height = 220,
}: {
  title: string;
  xLabels: string[];
  series: LineSeries[];
  currency: CurrencyCode;
  height?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  // Draw in real pixels so axis text stays legible on phones instead of scaling down with the viewBox.
  const [width, setWidth] = useState(640);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pad = { top: 12, right: 12, bottom: 28, left: 56 };
  const n = xLabels.length;
  const max = useMemo(() => Math.max(1, ...series.flatMap((s) => s.values)), [series]);
  const niceMax = niceCeil(max);
  const x = (i: number) => pad.left + (n <= 1 ? 0 : (i / (n - 1)) * (width - pad.left - pad.right));
  const y = (v: number) => pad.top + (1 - v / niceMax) * (height - pad.top - pad.bottom);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * niceMax);
  const labelEvery = Math.max(1, Math.ceil(n / Math.max(3, Math.floor(width / 80))));

  if (n < 2) return null;

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const px = ((e.clientX - box.left) / box.width) * width;
    const i = Math.round(((px - pad.left) / (width - pad.left - pad.right)) * (n - 1));
    setActive(Math.min(n - 1, Math.max(0, i)));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') setActive((a) => Math.min(n - 1, (a ?? -1) + 1));
    else if (e.key === 'ArrowLeft') setActive((a) => Math.max(0, (a ?? n) - 1));
    else return;
    e.preventDefault();
  };

  return (
    <figure className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <span className="type-headline !text-[17px]">{title}</span>
        {series.length > 1 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[var(--color-text-secondary)]">
            {series.map((s) => (
              <li key={s.name} className="inline-flex items-center gap-1.5">
                <span className="inline-block w-3 h-[2px] rounded-full" style={{ background: s.color }} aria-hidden="true" />
                {s.name}
              </li>
            ))}
          </ul>
        )}
      </figcaption>
      <div className="relative" ref={wrapRef}>
        <svg
          ref={ref}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto touch-pan-y focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] rounded-lg"
          role="img"
          aria-label={`${title}. Use the left and right arrow keys to read values.`}
          tabIndex={0}
          onPointerMove={onMove}
          onPointerLeave={() => setActive(null)}
          onKeyDown={onKey}
          onBlur={() => setActive(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="var(--color-border-subtle)" strokeWidth={1} />
              <text x={pad.left - 8} y={y(t)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="var(--color-text-muted)">
                {formatMoney(t, currency, { compact: true })}
              </text>
            </g>
          ))}
          {xLabels.map((l, i) =>
            i % labelEvery === 0 || i === n - 1 ? (
              <text key={l + i} x={x(i)} y={height - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} fontSize={11} fill="var(--color-text-muted)">
                {l}
              </text>
            ) : null,
          )}
          {series.map((s) => {
            const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
            return (
              <g key={s.name}>
                {s.area && <path d={`${d} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={s.color} opacity={0.1} />}
                <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              </g>
            );
          })}
          {active !== null && (
            <g>
              <line x1={x(active)} x2={x(active)} y1={pad.top} y2={height - pad.bottom} stroke="var(--color-border-hover)" strokeWidth={1} />
              {series.map((s) => (
                <circle key={s.name} cx={x(active)} cy={y(s.values[active] ?? 0)} r={4.5} fill={s.color} stroke="var(--color-surface)" strokeWidth={2} />
              ))}
            </g>
          )}
        </svg>
        {active !== null && (
          <div
            className="pointer-events-none absolute top-2 surface-overlay rounded-xl px-3 py-2 text-[13px] shadow-[var(--shadow-overlay)] bg-[var(--color-surface)] border border-[var(--color-border)]"
            style={{ left: `${(x(active) / width) * 100}%`, transform: `translateX(${active > n / 2 ? '-105%' : '5%'})` }}
            aria-live="polite"
          >
            <p className="font-medium text-[var(--color-ink)]">{xLabels[active]}</p>
            {series.map((s) => (
              <p key={s.name} className="flex items-center gap-1.5 text-[var(--color-text-secondary)] tabular-nums whitespace-nowrap">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                {s.name}: {formatMoney(s.values[active] ?? 0, currency, { decimals: 0 })}
              </p>
            ))}
          </div>
        )}
      </div>
    </figure>
  );
}

function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * magnitude >= value) ?? 10;
  return step * magnitude;
}

/* ------------------------------------------------------------------ tables & export */

export interface Column<Row> {
  header: string;
  cell: (row: Row) => string;
  align?: 'left' | 'right';
  /** Hide on phones (still in the CSV). Use for columns that repeat information, e.g. an opening
   *  balance that equals the previous row's closing balance. */
  hideOnMobile?: boolean;
}

/**
 * Collapsible data table (schedules, breakdowns) with CSV download of exactly what is shown.
 * Rendered closed by default so long schedules do not push the page content down.
 */
export function DataTable<Row>({
  title,
  columns,
  rows,
  csvName,
  defaultOpen = false,
}: {
  title: string;
  columns: Column<Row>[];
  rows: Row[];
  /** File name for the CSV download; omit to hide the button. */
  csvName?: string;
  defaultOpen?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    check();
    return () => ro.disconnect();
  }, [rows.length, columns.length]);

  if (rows.length === 0) return null;
  const download = () => {
    const csv = toCsv([columns.map((c) => c.header), ...rows.map((r) => columns.map((c) => c.cell(r)))]);
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = csvName!;
    a.click();
    URL.revokeObjectURL(url);
  };
  const cellClass = (c: Column<Row>) =>
    `py-2 px-1.5 sm:px-2 ${c.align === 'right' ? 'text-right' : 'text-left'} ${c.hideOnMobile ? 'hidden sm:table-cell' : ''}`;
  return (
    <details
      open={defaultOpen}
      onToggle={(e) => e.currentTarget.open && scrollRef.current && setOverflows(scrollRef.current.scrollWidth > scrollRef.current.clientWidth + 1)}
      className="group rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 sm:px-6 min-h-[56px]">
        <span className="type-headline !text-[17px]">{title}</span>
        <span className="text-sm text-[var(--color-brand-dark)] group-open:hidden">Show</span>
        <span className="text-sm text-[var(--color-brand-dark)] hidden group-open:inline">Hide</span>
      </summary>
      <div className="border-t border-[var(--color-border)]">
        {(csvName || overflows) && (
          <div className="flex items-center justify-between gap-3 px-3 pt-4 sm:px-6">
            <span className="text-[13px] text-[var(--color-text-muted)]">{overflows ? 'Scroll sideways to see every column.' : ''}</span>
            {csvName && (
              <button type="button" onClick={download} className="btn btn-sm rounded-full gap-1.5 bg-[var(--color-surface-subtle)] border-[var(--color-border)] text-[var(--color-ink)]">
                <Download className="w-4 h-4" aria-hidden="true" />
                Download CSV
              </button>
            )}
          </div>
        )}
        <div ref={scrollRef} tabIndex={overflows ? 0 : undefined} aria-label={overflows ? `${title}, scrollable` : undefined} className="max-h-[480px] overflow-auto px-3 pb-5 pt-3 sm:px-6">
          <table className="w-full border-collapse text-[13px] sm:text-[14px] tabular-nums">
            <thead className="sticky top-0 bg-[var(--color-surface)]">
              <tr>
                {columns.map((c) => (
                  <th key={c.header} scope="col" className={`${cellClass(c)} align-bottom font-semibold text-[var(--color-ink)] border-b border-[var(--color-border)]`}>
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-[var(--color-border-subtle)] last:border-0">
                  {columns.map((c) => (
                    <td key={c.header} className={`${cellClass(c)} text-[var(--color-text-secondary)] whitespace-nowrap`}>
                      {c.cell(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </details>
  );
}
