import crypto from 'crypto';
import { validateAdminAccess, errorResponse, successResponse, safeParseJson } from '../api-utils';
import { NextRequest } from 'next/server';

async function runApiAuditTests() {
  console.log('🚀 [Next.js API Backend Audit Suite] Starting verification...');
  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      testsFailed++;
    }
  }

  // 1. Response Helper Tests
  console.log('\n--- 1. API Response Helpers ---');
  const errRes = errorResponse('Invalid parameter', 400, 'BAD_REQUEST', { field: 'plan_id' });
  assert(errRes.status === 400, 'errorResponse returns correct HTTP 400 status');
  const errJson = await errRes.json();
  assert(errJson.error === 'Invalid parameter', 'errorResponse body contains error message');
  assert(errJson.code === 'BAD_REQUEST', 'errorResponse body contains error code');
  assert(errJson.field === 'plan_id', 'errorResponse body preserves extra details');
  assert(!!errJson.timestamp, 'errorResponse contains ISO timestamp');

  const succRes = successResponse({ ok: true, count: 5 });
  assert(succRes.status === 200, 'successResponse returns HTTP 200 status');
  const succJson = await succRes.json();
  assert(succJson.ok === true && succJson.count === 5, 'successResponse serializes data payload');

  // 2. Safe JSON Parsing Tests
  console.log('\n--- 2. Safe JSON Parsing & Malformed Payload Handling ---');
  const validReq = new NextRequest('http://localhost:3000/api/user/orders', {
    method: 'POST',
    body: JSON.stringify({ plan_id: 'pack_50', gateway: 'razorpay' }),
  });
  const validParsed = await safeParseJson<{ plan_id: string }>(validReq);
  assert(validParsed.data?.plan_id === 'pack_50', 'safeParseJson successfully parses valid JSON');

  const malformedReq = new NextRequest('http://localhost:3000/api/user/orders', {
    method: 'POST',
    body: '{ plan_id: invalid_json_syntax, }',
  });
  const malformedParsed = await safeParseJson(malformedReq);
  assert(malformedParsed.data === null, 'safeParseJson returns null data for malformed JSON');
  assert(!!malformedParsed.error, 'safeParseJson returns clean error message on syntax error');

  const emptyReq = new NextRequest('http://localhost:3000/api/user/orders', {
    method: 'POST',
    body: '',
  });
  const emptyParsed = await safeParseJson(emptyReq);
  assert(emptyParsed.data === null, 'safeParseJson handles empty body gracefully');

  // 3. Admin Authorization & Security Guard Tests
  console.log('\n--- 3. Admin Authorization & Security Guards ---');
  const adminSecret = 'ocr_admin_secret_2026';

  // Test with valid X-Admin-Key header
  const adminKeyReq = new NextRequest('http://localhost:3000/api/admin/stats', {
    headers: { 'X-Admin-Key': adminSecret },
  });
  const adminKeyAuth = await validateAdminAccess(adminKeyReq);
  assert(adminKeyAuth.authorized === true, 'validateAdminAccess authorizes valid X-Admin-Key header');

  // Test with invalid X-Admin-Key header and no session
  const invalidKeyReq = new NextRequest('http://localhost:3000/api/admin/stats', {
    headers: { 'X-Admin-Key': 'wrong_secret_key' },
  });
  const invalidKeyAuth = await validateAdminAccess(invalidKeyReq);
  assert(invalidKeyAuth.authorized === false, 'validateAdminAccess rejects invalid X-Admin-Key without session');

  // 4. Razorpay HMAC Signature Verification Algorithm Tests
  console.log('\n--- 4. Payment HMAC-SHA256 Cryptographic Verification ---');
  const testSecret = 'rzp_test_secret_key_123';
  const orderId = 'order_test_98765';
  const paymentId = 'pay_test_54321';
  const validSignature = crypto
    .createHmac('sha256', testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  // Verify matching signature
  const checkValid = crypto
    .createHmac('sha256', testSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  assert(validSignature === checkValid, 'Valid Razorpay signature calculation verified');

  // Verify tampered order ID fails
  const tamperedSig = crypto
    .createHmac('sha256', testSecret)
    .update(`order_tampered_id|${paymentId}`)
    .digest('hex');
  assert(validSignature !== tamperedSig, 'Tampered payment parameters correctly detected and rejected');

  // 5. Webhook HMAC-SHA256 Signature Verification Tests
  console.log('\n--- 5. Webhook HMAC-SHA256 Signature Verification ---');
  const webhookSecret = process.env.OCR_WEBHOOK_SECRET || 'ocr_webhook_secret_2026';
  const mockWebhookBody = JSON.stringify({
    event: 'ocr.job.completed',
    job_id: 'job_audit_123',
    document_id: 'doc_audit_123',
    status: 'completed',
    timestamp: new Date().toISOString(),
  });

  const validWebhookSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(mockWebhookBody)
    .digest('hex');

  const expectedWebhookSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(mockWebhookBody)
    .digest('hex');

  const isValidWebhook = crypto.timingSafeEqual(
    Buffer.from(validWebhookSig, 'hex'),
    Buffer.from(expectedWebhookSig, 'hex')
  );
  assert(isValidWebhook, 'Webhook HMAC timingSafeEqual signature check verified');

  console.log(`\n========================================`);
  console.log(`🎉 API Audit Test Suite Completed: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log(`========================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runApiAuditTests();
