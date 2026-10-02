import { getDatabase, ensureDatabaseIndexes } from '../mongodb';
import { findOrCreateUser, getUserQuota, getUserStats, incrementUserPageCount, addPurchasedPages, deleteUserAccount } from '../models/User';
import { saveDocumentExtraction, getUserDocuments, getDocumentById, getDocumentsByIds, deleteDocumentById, deleteAllUserDocuments } from '../models/Document';
import { createOrder, updateOrderStatus, getOrderById, getUserOrders, deleteAllUserOrders } from '../models/Order';
import { ExtractionResponse } from '@/types/ocr';

async function runDatabaseAuditTests() {
  console.log('🚀 [MongoDB Audit Suite] Starting comprehensive verification...');
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

  const testEmail = `audit_user_${Date.now()}@test.com`;

  try {
    // 1. Connection & Index Test
    console.log('\n--- 1. MongoDB Connection & Indexes ---');
    const db = await getDatabase();
    if (db) {
      assert(db.databaseName.length > 0, `Connected to database: "${db.databaseName}"`);
      await ensureDatabaseIndexes(db);
      
      const userIndexes = await db.collection('users').indexes();
      const hasEmailIndex = userIndexes.some(idx => idx.key.email === 1);
      assert(hasEmailIndex, 'Users collection has { email: 1 } index');

      const docIndexes = await db.collection('extractions').indexes();
      const hasDocUserIndex = docIndexes.some(idx => idx.key.user_email === 1 && idx.key.created_at === -1);
      assert(hasDocUserIndex, 'Extractions collection has compound { user_email: 1, created_at: -1 } index');

      const orderIndexes = await db.collection('orders').indexes();
      const hasOrderUserIndex = orderIndexes.some(idx => idx.key.user_email === 1 && idx.key.created_at === -1);
      assert(hasOrderUserIndex, 'Orders collection has compound { user_email: 1, created_at: -1 } index');
    } else {
      console.log('  ℹ️ MongoDB daemon offline; verifying in-memory fallback layer.');
    }

    // 2. User Lifecycle & Atomic Operations
    console.log('\n--- 2. User Lifecycle & Page Credit Operations ---');
    const user = await findOrCreateUser(testEmail, 'Audit Test User', null);
    assert(user.email === testEmail, 'User record created with normalized email');
    assert(user.tier === 'free', 'Default user tier is "free"');
    assert(user.free_pages_limit === 10, 'Default free page credit is 10');

    // Quota initial check
    const quotaInitial = await getUserQuota(testEmail);
    assert(quotaInitial.freePagesRemaining === 10, 'Initial free quota remaining is 10');
    assert(quotaInitial.totalPagesProcessed === 0, 'Initial processed count is 0');

    // Increment page count (decrement balance)
    await incrementUserPageCount(testEmail, 3);
    const quotaAfter3Pages = await getUserQuota(testEmail);
    assert(quotaAfter3Pages.totalPagesProcessed === 3, 'totalPagesProcessed correctly incremented to 3');
    assert(quotaAfter3Pages.freePagesRemaining === 7, 'freePagesRemaining correctly decremented to 7');

    // Add purchased pages (single roundtrip atomic update)
    const userWithCredits = await addPurchasedPages(testEmail, 50, 'pro');
    assert(userWithCredits.purchased_pages === 50, 'Purchased pages credited: 50');
    assert(userWithCredits.tier === 'pro', 'Tier updated to "pro"');

    const quotaAfterPurchase = await getUserQuota(testEmail);
    assert(quotaAfterPurchase.purchasedPages === 50, 'Quota reflects purchased pages');
    assert(quotaAfterPurchase.freePagesRemaining === 57, 'Total available remaining: (10 - 3) + 50 = 57');

    // 3. Document Extraction & Lean Projections
    console.log('\n--- 3. Document Extraction & Vault Querying ---');
    const mockExtraction: ExtractionResponse = {
      id: `doc_audit_${Date.now()}`,
      status: 'success',
      document_type: 'bank_statement',
      extraction: {
        bank_name: 'Audit Bank',
        transactions: [{ date: '2026-03-01', description: 'Test', debit: 50 }],
      },
      raw_text: 'LARGE RAW TEXT THAT SHOULD NOT BE LOADED IN LIST PROJECTION '.repeat(100),
      cleaned_text: 'LARGE CLEANED TEXT '.repeat(100),
      metadata: { pages: 3 },
    };

    const savedDoc = await saveDocumentExtraction(testEmail, mockExtraction, 'test_statement.pdf');
    assert(savedDoc.id === mockExtraction.id, 'Document extraction saved with correct ID');
    assert(savedDoc.user_email === testEmail, 'Document extraction linked to user email');

    // Query vault with projection
    const docList = await getUserDocuments(testEmail, 1, 20, 'all', '');
    assert(docList.total >= 1, `Vault listing returned ${docList.total} document(s)`);
    const foundDoc = docList.items.find(d => d.id === mockExtraction.id);
    assert(!!foundDoc, 'Saved document found in user documents list');
    assert(foundDoc?.pages === 3, 'Document page count correctly retrieved');
    // Ensure raw_text was not attached in list projection
    assert((foundDoc as unknown as { raw_text?: string }).raw_text === undefined, 'raw_text properly excluded from list projection (memory optimization)');

    // Query single document with full details
    const singleDoc = await getDocumentById(mockExtraction.id, testEmail);
    assert(!!singleDoc, 'Single document retrieval by ID succeeded');
    assert(singleDoc?.raw_text !== undefined, 'Full single document includes raw_text when inspecting');

    // 4. Orders & Billing Operations
    console.log('\n--- 4. Orders & Billing Operations ---');
    const order = await createOrder(testEmail, 'pack_50', 'razorpay');
    assert(order.order_id.startsWith('order_'), 'Order ID created with secure random format');
    assert(order.status === 'created', 'Initial order status is "created"');
    assert(order.pages_credited === 1000, 'Order pages credited correctly specified: 1000');

    // Retrieve order by ID
    const retrievedOrder = await getOrderById(order.order_id);
    assert(retrievedOrder?.order_id === order.order_id, 'getOrderById retrieved created order');

    // Update order status to completed
    const completedOrder = await updateOrderStatus(order.order_id, 'completed', {
      razorpay_payment_id: 'pay_audit_mock_123',
    });
    assert(completedOrder?.status === 'completed', 'Order status atomically updated to "completed"');

    // List user orders
    const userOrders = await getUserOrders(testEmail);
    assert(userOrders.length >= 1, `getUserOrders returned ${userOrders.length} order(s)`);

    // 5. User Stats Aggregation & Performance
    console.log('\n--- 5. User Stats Aggregation ---');
    const userStats = await getUserStats(testEmail);
    assert(userStats.stats.totalDocuments >= 1, `Stats total documents: ${userStats.stats.totalDocuments}`);
    assert(userStats.stats.totalPagesProcessed === 3, `Stats total pages processed: ${userStats.stats.totalPagesProcessed}`);

    // 6. GDPR & Cascade Data Cleanup
    console.log('\n--- 6. GDPR Cascade Data Cleanup ---');
    const deletedDocs = await deleteAllUserDocuments(testEmail);
    assert(deletedDocs >= 1, `Deleted user documents: ${deletedDocs}`);

    const deletedOrders = await deleteAllUserOrders(testEmail);
    assert(deletedOrders >= 1, `Deleted user orders: ${deletedOrders}`);

    const deletedUser = await deleteUserAccount(testEmail);
    assert(deletedUser, 'User account record permanently deleted');

    // Verify clean slate
    const postCleanupDocs = await getUserDocuments(testEmail);
    assert(postCleanupDocs.total === 0, 'Post-deletion documents list is empty (0 items)');

    console.log(`\n========================================`);
    console.log(`🎉 Audit Test Suite Completed: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log(`========================================\n`);

    if (testsFailed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Unhandled exception in audit test suite:', err);
    process.exit(1);
  }
}

runDatabaseAuditTests();
