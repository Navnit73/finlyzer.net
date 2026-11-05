/**
 * EMI-page helpers on top of the shared amortization engine (loan.ts).
 *
 * Indian borrowers usually need the schedule by financial year (April–March): lenders' interest
 * certificates and tax claims use it. With a first-EMI month, monthly rows are grouped by calendar
 * year or financial year instead of loan year. A partial first or last year is kept as is.
 */

import { fromMinor, toMinor } from './money.ts';
import type { ScheduleRow } from './loan.ts';

export type ScheduleBasis = 'loan' | 'calendar' | 'financial';

export interface PeriodRow {
  /** "Year 1", "2026", "FY 2026-27". */
  label: string;
  /** EMIs falling in this period. */
  emis: number;
  opening: number;
  payments: number;
  interest: number;
  principal: number;
  closing: number;
}

/** Calendar date of EMI number `month` (1-based), given the first EMI's month (0 = January). */
export function emiDate(firstMonth: number, firstYear: number, month: number): { month: number; year: number } {
  const index = firstYear * 12 + firstMonth + (month - 1);
  return { month: index % 12, year: Math.floor(index / 12) };
}

function periodKey(basis: ScheduleBasis, row: ScheduleRow, firstMonth: number, firstYear: number): string {
  if (basis === 'loan') return `Year ${Math.ceil(row.month / 12)}`;
  const d = emiDate(firstMonth, firstYear, row.month);
  if (basis === 'calendar') return String(d.year);
  // Financial year starts in April (month index 3).
  const start = d.month >= 3 ? d.year : d.year - 1;
  return `FY ${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

export function groupSchedule(rows: ScheduleRow[], basis: ScheduleBasis, firstMonth = 0, firstYear = 2026): PeriodRow[] {
  const out: PeriodRow[] = [];
  const minor: { payments: number; interest: number; principal: number }[] = [];
  for (const row of rows) {
    const label = periodKey(basis, row, firstMonth, firstYear);
    let p = out.at(-1);
    if (!p || p.label !== label) {
      p = { label, emis: 0, opening: row.opening, payments: 0, interest: 0, principal: 0, closing: row.closing };
      out.push(p);
      minor.push({ payments: 0, interest: 0, principal: 0 });
    }
    const m = minor[minor.length - 1];
    m.payments += toMinor(row.payment + row.extra);
    m.interest += toMinor(row.interest);
    m.principal += toMinor(row.principal + row.extra);
    p.emis += 1;
    p.payments = fromMinor(m.payments);
    p.interest = fromMinor(m.interest);
    p.principal = fromMinor(m.principal);
    p.closing = row.closing;
  }
  return out;
}
