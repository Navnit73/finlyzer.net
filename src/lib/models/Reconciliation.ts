import crypto from 'crypto';
import { getDatabase } from '../mongodb';
import { measureDbQuery } from '../db-logger';

/** Report counts kept on the record for the signed-in reconciliations list. */
export interface ReconciliationListSummary {
  currency: string | null;
  matched: number;
  unmatched_bank: number;
  unmatched_ledger: number;
  amount_mismatches: number;
  possible_duplicates: number;
  balance_status: string | null;
}

/**
 * Our record of a reconciliation run: who owns it, how many pages it used and whether a guest has
 * paid for it. The report itself stays in the reconciliation service. There is deliberately no
 * in-memory fallback, because this record decides what a guest can download.
 */
export interface ReconciliationRecord {
  reconciliation_id: string;
  /** Lower-cased account email, or 'guest'. */
  user_email: string;
  is_guest: boolean;
  /** SHA-256 of the service's guest access token; the token itself is only held by the browser. */
  access_token_hash?: string;
  bank_filename: string;
  ledger_filename: string;
  bank_pages: number;
  ledger_pages: number;
  /** Billable pages: bank + ledger. */
  pages: number;
  is_paid: boolean;
  payment_order_id?: string;
  /** Signed-in runs: set once the pages have been taken from the account balance. */
  pages_charged?: boolean;
  created_at: Date;
  /** Last state seen from the service; updated when the report is read, so the vault can list it. */
  status: 'queued' | 'processing' | 'completed' | 'failed';
  /** Counts copied from the finished report for the vault list. */
  summary?: ReconciliationListSummary;
  error?: string | null;
  completed_at?: Date;
  /** Guest runs only: MongoDB's TTL index removes the record after this time. */
  expires_at?: Date;
}

/**
 * The reconciliation service keeps its own `reconciliations` collection in the same database
 * (MONGODB_DB_NAME defaults to "finlyzer" in both apps), so ours needs a different name.
 */
export const RECONCILIATION_RECORDS_COLLECTION = 'site_reconciliations';

async function collection() {
  const db = await getDatabase();
  if (!db) throw new Error('Database unavailable');
  return db.collection<ReconciliationRecord>(RECONCILIATION_RECORDS_COLLECTION);
}

export function hashAccessToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createReconciliationRecord(record: ReconciliationRecord): Promise<void> {
  await measureDbQuery('createReconciliationRecord', async () => {
    const col = await collection();
    await col.insertOne(record as unknown as import('mongodb').OptionalUnlessRequiredId<ReconciliationRecord>);
  }, { reconciliation_id: record.reconciliation_id });
}

export async function getReconciliationRecord(id: string): Promise<ReconciliationRecord | null> {
  return await measureDbQuery('getReconciliationRecord', async () => {
    const col = await collection();
    return (await col.findOne({ reconciliation_id: id })) as ReconciliationRecord | null;
  }, { reconciliation_id: id });
}

export async function unlockReconciliation(id: string, orderId: string): Promise<void> {
  await measureDbQuery('unlockReconciliation', async () => {
    const col = await collection();
    await col.updateOne({ reconciliation_id: id }, { $set: { is_paid: true, payment_order_id: orderId } });
  }, { reconciliation_id: id, order_id: orderId });
}

/**
 * Atomically flags a signed-in run as charged. Returns true only for the caller that flipped it,
 * so concurrent status polls take the pages from the balance exactly once.
 */
export async function claimPageCharge(id: string): Promise<boolean> {
  return await measureDbQuery('claimPageCharge', async () => {
    const col = await collection();
    const result = await col.updateOne(
      { reconciliation_id: id, is_guest: false, pages_charged: { $ne: true } },
      { $set: { pages_charged: true } }
    );
    return result.modifiedCount === 1;
  }, { reconciliation_id: id });
}

/** Stores the final outcome of a run (once), so the vault can list it without calling the service. */
export async function saveReconciliationOutcome(
  id: string,
  outcome: { status: 'completed' | 'failed'; summary?: ReconciliationListSummary; error?: string | null }
): Promise<void> {
  await measureDbQuery('saveReconciliationOutcome', async () => {
    const col = await collection();
    await col.updateOne(
      { reconciliation_id: id, status: { $nin: ['completed', 'failed'] } },
      { $set: { ...outcome, completed_at: new Date() } }
    );
  }, { reconciliation_id: id });
}

/** A signed-in user's reconciliations, newest first. */
export async function listUserReconciliations(
  email: string,
  page: number,
  pageSize: number
): Promise<{ items: ReconciliationRecord[]; total: number }> {
  return await measureDbQuery('listUserReconciliations', async () => {
    const col = await collection();
    const filter = { user_email: email, is_guest: false };
    const [items, total] = await Promise.all([
      col
        .find(filter, { projection: { _id: 0, access_token_hash: 0 } })
        .sort({ created_at: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray(),
      col.countDocuments(filter),
    ]);
    return { items: items as ReconciliationRecord[], total };
  }, { email, page });
}
