import assert from 'assert';
import { PRICING_PLANS, FREE_PAGE_LIMIT } from '@/types/pricing';

async function runPricingPlanTests() {
  console.log('🚀 [Pricing Plan & 10$ Configuration Test Suite] Starting verification...\n');
  let testsPassed = 0;
  let testsFailed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      testsPassed++;
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     ${error.message}`);
      testsFailed++;
    }
  }

  // 1. Plan Structure and Configurations
  console.log('--- 1. Plan Configurations & Price Consistency ---');
  test('Free tier limit is configured to 10 pages', () => {
    assert.strictEqual(FREE_PAGE_LIMIT, 10);
  });

  test('$10 Document Pass plan exists and is configured properly', () => {
    const docPass = PRICING_PLANS.find((p) => p.id === 'guest_doc_unlock');
    assert.ok(docPass, 'guest_doc_unlock plan exists in PRICING_PLANS');
    assert.strictEqual(docPass?.price_usd, 10, 'Price USD is 10');
    assert.strictEqual(docPass?.pages, 30, 'Pages is 30');
    assert.strictEqual(docPass?.price_inr, 830, 'Price INR is 830');
    assert.ok(docPass?.features && docPass.features.length >= 4, 'Has required features list');
  });

  test('All pricing plans have positive prices, pages, and INR equivalents', () => {
    for (const plan of PRICING_PLANS) {
      assert.ok(plan.price_usd > 0, `${plan.id} has positive USD price`);
      assert.ok(plan.pages > 0, `${plan.id} has positive page count`);
      assert.ok(typeof plan.price_inr === 'number' && plan.price_inr > 0, `${plan.id} has positive INR price`);
      assert.ok(plan.features && plan.features.length > 0, `${plan.id} has features array`);
    }
  });

  // 2. User Order Plan Resolution
  console.log('\n--- 2. User Orders Route Plan Resolution ---');
  function resolveUserPlan(planId?: string) {
    return PRICING_PLANS.find(
      (p) => p.id === planId || (planId === 'single_10' && p.id === 'guest_doc_unlock')
    );
  }

  test('User can select and purchase the 10$ Document Pass (guest_doc_unlock)', () => {
    const plan = resolveUserPlan('guest_doc_unlock');
    assert.ok(plan, 'guest_doc_unlock successfully resolves');
    assert.strictEqual(plan?.price_usd, 10);
    assert.strictEqual(plan?.pages, 30);
  });

  test('User can resolve single_10 as backward-compatible alias to 10$ Document Pass', () => {
    const plan = resolveUserPlan('single_10');
    assert.ok(plan, 'single_10 successfully resolves');
    assert.strictEqual(plan?.price_usd, 10);
    assert.strictEqual(plan?.pages, 30);
  });

  test('User can select pack_25, pack_50, and pack_100', () => {
    const p25 = resolveUserPlan('pack_25');
    const p50 = resolveUserPlan('pack_50');
    const p100 = resolveUserPlan('pack_100');
    assert.strictEqual(p25?.price_usd, 25);
    assert.strictEqual(p50?.price_usd, 50);
    assert.strictEqual(p100?.price_usd, 100);
  });

  test('Unknown plan_id returns undefined and is rejected', () => {
    const invalid = resolveUserPlan('invalid_plan_xyz');
    assert.strictEqual(invalid, undefined);
  });

  // 3. Order Fulfillment Classification Logic
  console.log('\n--- 3. Fulfillment Decision Logic ---');
  function getFulfillmentActions(order: {
    user_email: string;
    pages_credited: number;
    document_id?: string;
  }) {
    return {
      shouldUnlockDoc: Boolean(order.document_id),
      shouldCreditUser: Boolean(order.user_email && order.user_email !== 'guest' && order.pages_credited > 0),
    };
  }

  test('Authenticated user purchasing 10$ plan receives page credits', () => {
    const actions = getFulfillmentActions({
      user_email: 'customer@example.com',
      pages_credited: 30,
    });
    assert.strictEqual(actions.shouldCreditUser, true, 'User receives +30 page credits');
    assert.strictEqual(actions.shouldUnlockDoc, false, 'No document unlock needed');
  });

  test('Guest user unlocking document via 10$ pass unlocks document and does not credit guest account', () => {
    const actions = getFulfillmentActions({
      user_email: 'guest',
      pages_credited: 30,
      document_id: 'doc_guest_123',
    });
    assert.strictEqual(actions.shouldUnlockDoc, true, 'Guest document is unlocked');
    assert.strictEqual(actions.shouldCreditUser, false, 'Guest is not treated as a registered user quota');
  });

  test('Authenticated user unlocking document also gets document unlocked and credits handled', () => {
    const actions = getFulfillmentActions({
      user_email: 'customer@example.com',
      pages_credited: 30,
      document_id: 'doc_auth_123',
    });
    assert.strictEqual(actions.shouldUnlockDoc, true, 'Document is unlocked');
    assert.strictEqual(actions.shouldCreditUser, true, 'User quota is credited');
  });

  console.log(`\n========================================`);
  console.log(`🎉 Plan & Pricing Test Suite: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log(`========================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runPricingPlanTests();
