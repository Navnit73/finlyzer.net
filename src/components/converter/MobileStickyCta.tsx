'use client';

import React, { useEffect, useState } from 'react';
import { openUploadPicker } from './UploadCtaButton';
import { FREE_PAGE_LIMIT } from '@/types/pricing';

/**
 * Mobile-only bottom bar that appears once the hero upload card has scrolled
 * out of view, so the primary action is always one tap away. It hides again
 * over the final CTA and footer so it never covers them.
 */
export default function MobileStickyCta({
  label = 'Convert a Statement Free',
  note = `Free up to ${FREE_PAGE_LIMIT} pages · No signup`,
}: {
  label?: string;
  note?: string;
} = {}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const targets = [
      document.getElementById('upload'),
      document.getElementById('final-cta'),
      document.querySelector('footer'),
    ].filter((el): el is HTMLElement => !!el);
    if (!targets.length || typeof IntersectionObserver === 'undefined') return;

    const inView = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.add(entry.target);
        else inView.delete(entry.target);
      }
      setIsVisible(inView.size === 0);
    });
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!isVisible}
      className={`sm:hidden fixed inset-x-0 bottom-0 z-30 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] surface-frosted hairline-t transition-transform duration-300 ease-[var(--ease-apple)] ${
        isVisible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
      }`}
    >
      <button
        type="button"
        tabIndex={isVisible ? 0 : -1}
        onClick={openUploadPicker}
        className="btn-brand-primary w-full !min-h-[50px] !text-[17px]"
      >
        {label}
      </button>
      <p className="mt-1.5 text-center text-xs text-[var(--color-text-muted)]">{note}</p>
    </div>
  );
}
