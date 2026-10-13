'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size: number;
  imageClassName: string;
  fallbackClassName: string;
}

// Renders the user's profile photo, falling back to their initial when the
// image is missing or fails to load (e.g. Google avatar blocked by referrer).
export default function UserAvatar({ src, name, size, imageClassName, fallbackClassName }: UserAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (src && failedSrc !== src) {
    return (
      <Image
        src={src}
        alt={name || 'User'}
        width={size}
        height={size}
        unoptimized
        referrerPolicy="no-referrer"
        onError={() => setFailedSrc(src)}
        className={imageClassName}
      />
    );
  }

  return (
    <div className={fallbackClassName} aria-label={name || 'User'} role="img">
      {name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  );
}
