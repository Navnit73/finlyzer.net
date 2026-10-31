import type { Transaction } from '@/types/ocr';

/** Income (money in), investment (money out into savings or markets) or expense (all other money out). */
export type TransactionKind = 'income' | 'expense' | 'investment';

export const TRANSACTION_KIND_META: Record<
  TransactionKind,
  { label: string; plural: string; text: string; soft: string; fill: string }
> = {
  income: {
    label: 'Income',
    plural: 'Income',
    text: 'text-[var(--color-success)]',
    soft: 'bg-[var(--color-success-soft)]',
    fill: 'bg-[var(--color-success)]',
  },
  expense: {
    label: 'Expense',
    plural: 'Expenses',
    text: 'text-[var(--color-danger)]',
    soft: 'bg-[var(--color-danger-soft)]',
    fill: 'bg-[var(--color-danger)]',
  },
  investment: {
    label: 'Investment',
    plural: 'Investments',
    text: 'text-[var(--color-info)]',
    soft: 'bg-[var(--color-info-soft)]',
    fill: 'bg-[var(--color-info)]',
  },
};

const INVESTMENT_RE =
  /\bsip\b|mutual fund|\bmf\b|\bppf\b|\bnps\b|\brd\b|recurring deposit|\bfd\b|fixed deposit|term deposit|zerodha|groww|upstox|angel one|kuvera|coin by|smallcase|broking|brokerage|demat|\betf\b|stocks?\b|shares?\b|equity|gold bond|\bsgb\b|vanguard|fidelity|schwab|robinhood|e\*?trade|wealthfront|betterment|\b401k\b|\bira\b|invest/i;

export function transactionKind(tx: Pick<Transaction, 'description' | 'category' | 'credit' | 'debit'>): TransactionKind {
  if (tx.credit && tx.credit > 0) return 'income';
  return INVESTMENT_RE.test(`${tx.description || ''} ${tx.category || ''}`) ? 'investment' : 'expense';
}
