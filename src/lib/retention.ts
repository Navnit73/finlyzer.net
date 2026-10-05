/**
 * Data retention policy. Referenced by the storage layer (TTL) and by the
 * Privacy / Security pages, so the published policy can't drift from the code.
 */

/** Guest uploads and their extracted data are deleted this many hours after upload. */
export const GUEST_RETENTION_HOURS = 24;

/** Expiry timestamp for a new guest document. MongoDB's TTL monitor removes it shortly after. */
export function guestExpiryDate(from: Date = new Date()): Date {
  return new Date(from.getTime() + GUEST_RETENTION_HOURS * 60 * 60 * 1000);
}
