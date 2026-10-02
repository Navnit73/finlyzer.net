'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Hook to safely check if component is mounted on the client.
 * Uses useSyncExternalStore (React 18/19 official standard) to avoid SSR hydration mismatches
 * and avoid react-hooks/set-state-in-effect ESLint errors.
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
