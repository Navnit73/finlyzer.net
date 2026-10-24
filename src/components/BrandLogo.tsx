import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  showText?: boolean;
  tag?: string;
  href?: string | null;
  /** Accessible name of the logo link. */
  linkLabel?: string;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  priority?: boolean;
  onClick?: () => void;
}

const SIZE_MAP = {
  sm: { px: 24, class: 'w-6 h-6' },
  md: { px: 32, class: 'w-8 h-8' },
  lg: { px: 40, class: 'w-10 h-10' },
  xl: { px: 48, class: 'w-12 h-12' },
};

export default function BrandLogo({
  size = 'lg',
  showText = true,
  tag,
  href = '/',
  linkLabel = 'Finlyzers Home',
  className = '',
  imageClassName = '',
  textClassName = '',
  priority = false,
  onClick,
}: BrandLogoProps) {
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size].px;
  const sizeClass = typeof size === 'number' ? '' : SIZE_MAP[size].class;
  const customInlineStyle = typeof size === 'number' ? { width: `${size}px`, height: `${size}px` } : undefined;

  const content = (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <div
        style={customInlineStyle}
        className={`relative ${sizeClass} shrink-0 overflow-hidden rounded-md ${imageClassName}`}
      >
        <Image
          src="/logo.png"
          alt="Finlyzers Logo"
          width={pixelSize * 2}
          height={pixelSize * 2}
          priority={priority}
          className="w-full h-full object-contain"
        />
      </div>
      {showText && (
        <span className={`flex items-center text-xl font-semibold tracking-[-0.02em] text-[var(--color-ink)] ${textClassName}`}>
          <span>Finlyzers</span>
          {tag && (
            <span className="ml-2 px-1.5 py-0.5 text-[11px] font-medium bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)] rounded-md tracking-normal">
              {tag}
            </span>
          )}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="inline-flex items-center min-h-[44px] rounded-md hover:opacity-80 transition-opacity"
        aria-label={linkLabel}
      >
        {content}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={onClick ? 'cursor-pointer' : undefined}>
      {content}
    </div>
  );
}
