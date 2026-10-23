'use client';

import type { ComponentProps } from 'react';
import dynamic from 'next/dynamic';
import type AuthModalComponent from './AuthModal';

const AuthModal = dynamic(() => import('./AuthModal'));

/**
 * AuthModal, loaded only the first time it opens, so guests reading a page don't download the
 * sign-in code. Import this instead of ./AuthModal; it takes the same props.
 */
export default function LazyAuthModal(props: ComponentProps<typeof AuthModalComponent>) {
  return props.isOpen ? <AuthModal {...props} /> : null;
}
