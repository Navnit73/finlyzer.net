/** Types for the bank reconciliation service (`/api/v1/reconciliation`, see api.md). */

export type ReconciliationStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type ReconciliationCategory =
  | 'matched'
  | 'unmatched_bank'
  | 'unmatched_ledger'
  | 'possible_duplicates'
  | 'amount_mismatches';

export const RECONCILIATION_CATEGORIES: ReconciliationCategory[] = [
  'matched',
  'unmatched_bank',
  'unmatched_ledger',
  'possible_duplicates',
  'amount_mismatches',
];

export interface ReconTransaction {
  id: string;
  source: 'bank' | 'ledger';
  row: number;
  date: string | null;
  original_date?: string | null;
  description?: string | null;
  reference?: string | null;
  debit: string | null;
  credit: string | null;
  amount: string;
  flow: 'in' | 'out';
  balance?: string | null;
}

export interface MatchedItem {
  category: 'matched';
  bank_transaction: ReconTransaction;
  ledger_transaction: ReconTransaction;
  amount: string;
  date_difference_days: number | null;
  match_basis: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface UnmatchedItem extends ReconTransaction {
  category: 'unmatched_bank' | 'unmatched_ledger';
  reason: string;
}

export interface DuplicateItem {
  category: 'possible_duplicates';
  source: 'bank' | 'ledger';
  count: number;
  transaction_ids: string[];
  transactions: ReconTransaction[];
  reason: string;
}

export interface MismatchItem {
  category: 'amount_mismatches';
  type: 'amount_mismatch' | 'direction_mismatch' | 'amount_and_direction_mismatch';
  bank_transaction: ReconTransaction;
  ledger_transaction: ReconTransaction;
  bank_amount: string;
  ledger_amount: string;
  difference: string;
  date_difference_days: number | null;
  reason: string;
}

export type ReconItem = MatchedItem | UnmatchedItem | DuplicateItem | MismatchItem;

export type CheckStatus = 'passed' | 'failed' | 'unverifiable';

export interface RunningBalanceCheck {
  status: CheckStatus;
  checked: number;
  breaks_count: number;
  breaks: { transaction_id: string; date: string | null; expected_balance: string; stated_balance: string; difference: string }[];
}

export interface DocumentBalanceCheck {
  opening_balance?: string | null;
  closing_balance?: string | null;
  bank_opening_balance?: string | null;
  bank_closing_balance?: string | null;
  calculated_closing_balance: string | null;
  difference: string | null;
  status: CheckStatus;
  opening_balance_source: string | null;
  closing_balance_source: string | null;
  running_balance?: RunningBalanceCheck;
}

export interface BalanceCheck extends DocumentBalanceCheck {
  ledger?: DocumentBalanceCheck;
  book_to_bank?: {
    explained_by_discrepancies: string | null;
    closing_balance_difference: string | null;
    opening_balance_difference: string | null;
    unexplained_difference: string | null;
    status: CheckStatus;
  };
}

export interface ReconciliationSummary {
  currency: string | null;
  amount_decimal_places: number;
  bank_transactions: number;
  ledger_transactions: number;
  matched: number;
  unmatched_bank: number;
  unmatched_ledger: number;
  possible_duplicates: number;
  amount_mismatches: number;
  amount_corrections: number;
  ledger_direction_convention: 'bank' | 'book';
  date_tolerance_days: number;
  description_matching: boolean;
}

export interface AmountCorrection {
  source: 'bank' | 'ledger';
  transaction_id: string | null;
  field: string;
  extracted: string;
  corrected: string;
}

/** The saved report. The per-category arrays are fetched page by page through /transactions. */
export interface ReconciliationResult {
  summary: ReconciliationSummary;
  balance_check: BalanceCheck;
  amount_corrections: AmountCorrection[];
  warnings: string[];
}

/** Our own access state for a reconciliation, added by the Next.js API on top of the service response. */
export interface ReconciliationAccess {
  is_guest: boolean;
  pages: number;
  /** True for guest runs of 11-30 pages until the Document Pass is paid: details are previewed only. */
  locked: boolean;
  preview_rows: number;
  bank_filename: string;
  ledger_filename: string;
  expires_at: string | null;
}

export interface ReconciliationStatusResponse {
  success: boolean;
  reconciliation_id: string;
  status: ReconciliationStatus;
  progress: number;
  message: string;
  result: ReconciliationResult | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
  access: ReconciliationAccess;
}

export interface ReconciliationTransactionsResponse {
  success: boolean;
  reconciliation_id: string;
  status: ReconciliationCategory | 'all';
  total: number;
  page: number;
  page_size: number;
  transactions: ReconItem[];
  locked: boolean;
}
