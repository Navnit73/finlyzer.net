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

  const variantStyles = {
    brand: {
      bg: 'bg-[var(--color-brand-soft)]',
      border: 'border-[var(--color-brand)]',
      accent: 'text-[var(--color-ink)]',
      iconBg: 'bg-[var(--color-brand)] text-[var(--color-on-brand)]',
    },
    blue: {
      bg: 'bg-[var(--media-blue-soft)]',
      border: 'border-[var(--media-blue-border)]',
      accent: 'text-[var(--media-blue-text)]',
      iconBg: 'bg-[var(--media-blue)] text-white',
    },
    violet: {
      bg: 'bg-[var(--media-violet-soft)]',
      border: 'border-[var(--media-violet-border)]',
      accent: 'text-[var(--media-violet)]',
      iconBg: 'bg-[var(--media-violet)] text-white',
    },
    pink: {
      bg: 'bg-[var(--media-pink-soft)]',
      border: 'border-[var(--media-pink-border)]',
      accent: 'text-[var(--media-pink)]',
      iconBg: 'bg-[var(--media-pink)] text-white',
    },
    neutral: {
      bg: 'bg-[var(--color-surface)]',
      border: 'border-[var(--color-border)]',
      accent: 'text-[var(--color-ink)]',
      iconBg: 'bg-[var(--color-surface-subtle)] text-[var(--color-ink)]',
    },
  };

  const style = variantStyles[variant];

  return (
    <div
      className={`p-3.5 sm:p-4.5 rounded-lg border ${style.border} ${style.bg} flex flex-col justify-between space-y-2 sm:space-y-3 transition-colors min-w-0 overflow-hidden shadow-none`}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]/70 truncate">
          {title}
        </span>
        {Icon && (
          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${style.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p
          className="text-lg sm:text-2xl lg:text-3xl font-black text-[var(--color-ink)] tracking-tight truncate"
          title={String(formattedValue)}
        >
          {formattedValue || '—'}
        </p>
        {subtitle && (
          <p className="text-[10px] sm:text-xs text-[var(--color-ink)]/60 mt-0.5 font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

