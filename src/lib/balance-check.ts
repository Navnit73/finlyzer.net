import type { Transaction } from '@/types/ocr';

export interface BalanceCheckResult {
  status: 'verified' | 'mismatch' | 'unverifiable';
  /** Rows whose printed balance could be compared. */
  checkedRows: number;
  /** Indices (into the original transactions array) whose printed balance doesn't match. */
  mismatchRows: number[];
  /** Whether the final computed balance equals the statement's closing balance (null if unknown). */
  closingMatches: boolean | null;
}

const TOLERANCE = 0.01;

function isNum(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

function runChain(
  rows: { t: Transaction; index: number }[],
  opening: number | null | undefined,
  closing: number | null | undefined
): BalanceCheckResult {
  let prev: number | null = isNum(opening) ? opening : null;
  let checkedRows = 0;
  const mismatchRows: number[] = [];

  for (const { t, index } of rows) {
    const delta = (t.credit || 0) - (t.debit || 0);
    if (prev === null) {
      // No opening balance: anchor on the first printed balance (that row itself can't be checked).
      if (isNum(t.balance)) prev = t.balance;
      continue;
    }
    const expected = prev + delta;
    if (isNum(t.balance)) {
      checkedRows++;
      if (Math.abs(expected - t.balance) > TOLERANCE) mismatchRows.push(index);
      // Re-anchor on the printed balance so one bad row doesn't flag every row after it.
      prev = t.balance;
    } else {
      prev = expected;
    }
  }

  const closingMatches = isNum(closing) && prev !== null ? Math.abs(prev - closing) <= TOLERANCE : null;

  let status: BalanceCheckResult['status'];
  if (checkedRows === 0 && closingMatches === null) status = 'unverifiable';
  else if (mismatchRows.length > 0 || closingMatches === false) status = 'mismatch';
  else status = 'verified';

  return { status, checkedRows, mismatchRows, closingMatches };
}

/**
 * Recomputes the running balance (previous + credit − debit) and compares it with the balance printed on
 * each row and with the closing balance. Statements listed newest-first are handled by also checking the
 * reversed order and keeping whichever order fits better.
 */
export function checkRunningBalance(
  transactions: Transaction[],
  opening?: number | null,
  closing?: number | null
): BalanceCheckResult {
  if (transactions.length === 0) {
    return { status: 'unverifiable', checkedRows: 0, mismatchRows: [], closingMatches: null };
  }

  const rows = transactions.map((t, index) => ({ t, index }));
  const forward = runChain(rows, opening, closing);
  if (forward.status === 'verified') return forward;

  const reversed = runChain([...rows].reverse(), opening, closing);
  const score = (r: BalanceCheckResult) => r.mismatchRows.length + (r.closingMatches === false ? 1 : 0);
  return score(reversed) < score(forward) ? { ...reversed, mismatchRows: reversed.mismatchRows.sort((a, b) => a - b) } : forward;
}
