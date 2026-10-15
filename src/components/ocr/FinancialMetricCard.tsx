'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FinancialMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: 'brand' | 'blue' | 'violet' | 'pink' | 'neutral';
  currency?: string;
}

export default function FinancialMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'neutral',
  currency,
}: FinancialMetricCardProps) {
  const formattedValue = typeof value === 'number'
    ? new Intl.NumberFormat('en-US', {
        style: currency ? 'currency' : 'decimal',
        currency: currency || 'USD',
        maximumFractionDigits: 2,
      }).format(value)
    : value;

  // Variants are kept for API compatibility. The Apple-style KPI is intentionally
  // restrained: one neutral hairline card; "brand" only tints the label.
  const labelColor =
    variant === 'brand' ? 'text-[var(--color-brand-dark)]' : 'text-[var(--color-text-muted)]';

  return (
    <div className="p-4 sm:p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col justify-between gap-2 min-w-0 overflow-hidden">
      <div className={`flex items-center gap-1.5 min-w-0 ${labelColor}`}>
        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
        <span className="text-[13px] font-medium truncate">{title}</span>
      </div>

      <div className="min-w-0">
        <p
          className="text-xl sm:text-2xl lg:text-[28px] font-semibold text-[var(--color-ink)] tracking-tight tabular-nums truncate leading-tight"
          title={String(formattedValue)}
        >
          {formattedValue || '—'}
        </p>
        {subtitle && (
          <p className="text-xs text-[var(--color-text-muted)] mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
