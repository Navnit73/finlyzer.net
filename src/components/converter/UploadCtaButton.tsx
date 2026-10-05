'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { UPLOAD_INPUT_ID } from './ConverterHero';

interface UploadCtaButtonProps {
  label?: string;
  className?: string;
}

/**
 * Opens the hero file picker directly (one tap on mobile), falling back to
 * scrolling to the upload section when the picker isn't on the page.
 */
export function openUploadPicker() {
  document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.getElementById(UPLOAD_INPUT_ID)?.click();
}

export default function UploadCtaButton({
  label = 'Convert a Statement Free',
  className = 'btn-brand-primary',
}: UploadCtaButtonProps) {
  return (
    <button type="button" onClick={openUploadPicker} className={className}>
      <span>{label}</span>
      <ArrowRight className="w-5 h-5" />
    </button>
  );
}
