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
      bg: 'bg-[var(--color-brand-soft)]/50',
      border: 'border-[var(--color-brand)]/40',
      accent: 'text-[var(--color-ink)]',
      iconBg: 'bg-[var(--color-brand)] text-[var(--color-on-brand)]',
    },
    blue: {
      bg: 'bg-[#EBF5FC]',
      border: 'border-[var(--media-blue)]/50',
      accent: 'text-[#1D6399]',
      iconBg: 'bg-[var(--media-blue)] text-white',
    },
    violet: {
      bg: 'bg-[#F2EDFD]',
      border: 'border-[var(--media-violet)]/40',
      accent: 'text-[var(--media-violet)]',
      iconBg: 'bg-[var(--media-violet)] text-white',
    },
    pink: {
      bg: 'bg-[#FDF0F5]',
      border: 'border-[var(--media-pink)]/40',
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
      className={`p-4 sm:p-5 rounded-2xl border ${style.border} ${style.bg} shadow-sm flex flex-col justify-between space-y-3 transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
          {title}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg ${style.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
            <Icon className="w-4 h-4 stroke-[2.5]" />
          </div>
        )}
      </div>

      <div>
        <p className="text-2xl sm:text-3xl font-black text-[var(--color-ink)] tracking-tight">
          {formattedValue || '—'}
        </p>
        {subtitle && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
