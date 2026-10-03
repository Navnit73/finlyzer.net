/**
 * Test Suite: Guest Flow vs Authenticated Flow Separation Verification
 * Run: npx tsx src/lib/__tests__/guest-auth-flow.test.ts
 */

import assert from 'assert';
import {
  saveDocumentExtraction,
  getDocumentById,
  getUserDocuments,
  unlockGuestDocument,
  deleteDocumentById,
} from '../models/Document';
import { createOrder, updateOrderStatus, getOrderById } from '../models/Order';
import { findOrCreateUser, getUserQuota, incrementUserPageCount } from '../models/User';
import { ExtractionResponse } from '@/types/ocr';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return (async () => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     ${error.message}`);
      failed++;
    }
  })();
}

async function runGuestAuthFlowTests() {
  console.log('\n🚀 [Guest vs Authenticated Flow Audit Suite] Starting verification...\n');

  // ==========================================
  // Section 1: Guest 1–10 Page Free Flow
  // ==========================================
  console.log('--- 1. Guest 1–10 Page Free Flow ---');

  const guestFreeExtraction: ExtractionResponse = {
    id: `guest_free_${Date.now()}`,
    status: 'success',
    document_type: 'bank_statement',
    filename: 'guest_small_statement.pdf',
    extraction: {
      currency: 'USD',
      opening_balance: 1000,
      closing_balance: 1500,
      total_deposits: 500,
      total_withdrawals: 0,
      transactions: [{ date: '2026-01-01', description: 'Deposit', credit: 500, debit: 0, balance: 1500 }],
    },
    metadata: { pages: 5 },
  };

  await test('Guest document (5 pages) is saved as is_guest: true and is_paid: true (Free Tier)', async () => {
    const saved = await saveDocumentExtraction('guest', guestFreeExtraction, 'guest_small_statement.pdf', {
      isGuest: true,
      isPaid: true,
    });
    assert.strictEqual(saved.is_guest, true);
    assert.strictEqual(saved.is_paid, true);
    assert.strictEqual(saved.pages, 5);
  });

  await test('Guest document (5 pages) can be retrieved by ID without authentication', async () => {
    const doc = await getDocumentById(guestFreeExtraction.id);
    assert.ok(doc);
    assert.strictEqual(doc?.id, guestFreeExtraction.id);
    assert.strictEqual(doc?.is_paid, true);
  });

  // ==========================================
  // Section 2: Guest 11–30 Page Pay-to-Download Flow
  // ==========================================
  console.log('\n--- 2. Guest 11–30 Page Pay-to-Download Flow ---');

  const guestPaidExtraction: ExtractionResponse = {
    id: `guest_paid_${Date.now()}`,
    status: 'success',
    document_type: 'bank_statement',
    filename: 'guest_medium_statement.pdf',
    extraction: {
      currency: 'USD',
      opening_balance: 5000,
      closing_balance: 6200,
      total_deposits: 1200,
      total_withdrawals: 0,
      transactions: [{ date: '2026-02-01', description: 'Wire', credit: 1200, debit: 0, balance: 6200 }],
    },
    metadata: { pages: 18 },
  };

  await test('Guest document (18 pages) is saved as is_guest: true and is_paid: false (Pay-to-Download)', async () => {
    const saved = await saveDocumentExtraction('guest', guestPaidExtraction, 'guest_medium_statement.pdf', {
      isGuest: true,
      isPaid: false,
    });
    assert.strictEqual(saved.is_guest, true);
    assert.strictEqual(saved.is_paid, false);
    assert.strictEqual(saved.pages, 18);
  });

  await test('Unpaid 18-page guest document reflects is_paid: false in database', async () => {
    const doc = await getDocumentById(guestPaidExtraction.id);
    assert.ok(doc);
    assert.strictEqual(doc?.is_paid, false);
    assert.strictEqual(doc?.pages, 18);
  });

  let unlockOrderId = '';
  await test('Guest can create an unlock checkout order for 11-30 page document', async () => {
    const order = await createOrder('guest', 'guest_doc_unlock', 'razorpay');
    assert.ok(order.order_id);
    assert.strictEqual(order.amount_usd, 10);
    assert.strictEqual(order.status, 'created');
    unlockOrderId = order.order_id;
  });

  await test('Guest payment verification marks order completed and unlocks document', async () => {
    const updatedOrder = await updateOrderStatus(unlockOrderId, 'completed', {
      razorpay_payment_id: `pay_${Date.now()}`,
      razorpay_order_id: unlockOrderId,
    });
    assert.strictEqual(updatedOrder?.status, 'completed');

    const unlockedDoc = await unlockGuestDocument(guestPaidExtraction.id, unlockOrderId);
    assert.ok(unlockedDoc);
    assert.strictEqual(unlockedDoc?.is_paid, true);
    assert.strictEqual(unlockedDoc?.payment_order_id, unlockOrderId);
  });

  await test('Unlocked guest document now reflects is_paid: true for download eligibility', async () => {
    const doc = await getDocumentById(guestPaidExtraction.id);
    assert.ok(doc);
    assert.strictEqual(doc?.is_paid, true);
  });

  // ==========================================
  // Section 3: Authenticated User Isolation & No Mixing
  // ==========================================
  console.log('\n--- 3. Authenticated User Flow & Strict Isolation ---');

  const authUserEmail = `user_flow_test_${Date.now()}@example.com`;

  await test('Authenticated user account initialized', async () => {
    const user = await findOrCreateUser(authUserEmail, 'Audited User', null);
    assert.strictEqual(user.email, authUserEmail);
    assert.strictEqual(user.tier, 'free');
  });

  const authUserDoc: ExtractionResponse = {
    id: `auth_doc_${Date.now()}`,
    status: 'success',
    document_type: 'bank_statement',
    filename: 'corporate_q1_statement.pdf',
    extraction: {
      currency: 'USD',
      opening_balance: 50000,
      closing_balance: 75000,
      total_deposits: 25000,
      total_withdrawals: 0,
      transactions: [],
    },
    metadata: { pages: 45 },
  };

  await test('Authenticated user processes long document (45 pages) with account quota', async () => {
    const saved = await saveDocumentExtraction(authUserEmail, authUserDoc, 'corporate_q1_statement.pdf', {
      isGuest: false,
      isPaid: true,
    });
    assert.strictEqual(saved.user_email, authUserEmail);
    assert.strictEqual(saved.is_guest, false);
    assert.strictEqual(saved.is_paid, true);

    await incrementUserPageCount(authUserEmail, 45);
    const quota = await getUserQuota(authUserEmail);
    assert.strictEqual(quota.totalPagesProcessed, 45);
  });

  await test('getUserDocuments strictly returns ONLY authenticated user docs (No guest leakage)', async () => {
    const result = await getUserDocuments(authUserEmail);
    assert.strictEqual(result.items.length, 1);
    assert.strictEqual(result.items[0].id, authUserDoc.id);

    // Verify guest docs are NOT mixed into user vault
    assert.strictEqual(result.items.some((d) => d.id === guestFreeExtraction.id), false);
    assert.strictEqual(result.items.some((d) => d.id === guestPaidExtraction.id), false);
  });

  // ==========================================
  // Summary
  // ==========================================
  console.log('\n========================================');
  console.log(`🎉 Guest/Auth Flow Test Suite Completed: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runGuestAuthFlowTests().catch((err) => {
  console.error('Test runner fatal crash:', err);
  process.exit(1);
});
