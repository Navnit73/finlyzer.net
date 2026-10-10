import crypto from 'crypto';
import { getDatabase } from '../mongodb';
import { PricingPlan, OrderRecord, PRICING_PLANS } from '@/types/pricing';
import { measureDbQuery } from '../db-logger';

export type { PricingPlan, OrderRecord };
export { PRICING_PLANS };

// Orders are money records, so there is deliberately no in-memory fallback: if the database is
// unreachable these functions throw, which makes the API return 5xx and Razorpay retry webhooks.
async function ordersCollection() {
  const db = await getDatabase();
  if (!db) throw new Error('Database unavailable');
  return db.collection<OrderRecord>('orders');
}

export async function createOrder(
  userEmail: string,
  planId: PricingPlan['id'],
  gateway: OrderRecord['payment_gateway'] = 'razorpay',
  extra: Pick<OrderRecord, 'document_id'> = {}
): Promise<OrderRecord> {
  const normalizedEmail = userEmail.toLowerCase().trim();
  const plan = PRICING_PLANS.find((p) => p.id === planId);
  if (!plan) throw new Error(`Unknown plan: ${planId}`);

  const orderId = `order_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
  const now = new Date().toISOString();

  const orderRecord: OrderRecord = {
    order_id: orderId,
    user_email: normalizedEmail,
    plan_id: plan.id,
    plan_name: plan.name,
    amount_usd: plan.price_usd,
    amount_inr: plan.price_inr || plan.price_usd * 83,
    pages_credited: plan.pages,
    status: 'created',
    payment_gateway: gateway,
    ...(extra.document_id ? { document_id: extra.document_id } : {}),
    created_at: now,
    updated_at: now,
  };

  return await measureDbQuery('createOrder', async () => {
    const collection = await ordersCollection();
    await collection.insertOne(orderRecord as unknown as import('mongodb').OptionalUnlessRequiredId<OrderRecord>);
    return orderRecord;
  }, { order_id: orderId, user_email: normalizedEmail, plan_id: plan.id });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderRecord['status'],
  paymentDetails?: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  }
): Promise<OrderRecord | null> {
  return await updateOrderFields(orderId, { status, ...(paymentDetails || {}) });
}

async function updateOrderFields(orderId: string, fields: Partial<OrderRecord>): Promise<OrderRecord | null> {
  return await measureDbQuery('updateOrderFields', async () => {
    const collection = await ordersCollection();
    const result = await collection.findOneAndUpdate(
      { order_id: orderId },
      { $set: { ...fields, updated_at: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    return (result as unknown as OrderRecord) || null;
  }, { order_id: orderId });
}

export async function getOrderById(orderId: string): Promise<OrderRecord | null> {
  return await measureDbQuery('getOrderById', async () => {
    const collection = await ordersCollection();
    return (await collection.findOne({ order_id: orderId })) as unknown as OrderRecord | null;
  }, { order_id: orderId });
}

export async function getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<OrderRecord | null> {
  return await measureDbQuery('getOrderByRazorpayOrderId', async () => {
    const collection = await ordersCollection();
    return (await collection.findOne({ razorpay_order_id: razorpayOrderId })) as unknown as OrderRecord | null;
  }, { razorpay_order_id: razorpayOrderId });
}

export async function getUserOrders(userEmail: string): Promise<OrderRecord[]> {
  const normalizedEmail = userEmail.toLowerCase().trim();
  return await measureDbQuery('getUserOrders', async () => {
    const collection = await ordersCollection();
    return await collection.find({ user_email: normalizedEmail }).sort({ created_at: -1 }).toArray();
  }, { user_email: normalizedEmail });
}

export async function deleteAllUserOrders(userEmail: string): Promise<number> {
  const normalizedEmail = userEmail.toLowerCase().trim();
  return await measureDbQuery('deleteAllUserOrders', async () => {
    const collection = await ordersCollection();
    return (await collection.deleteMany({ user_email: normalizedEmail })).deletedCount;
  }, { user_email: normalizedEmail });
}

export async function setOrderPayerDetails(
  orderId: string,
  details: Pick<OrderRecord, 'payer_name' | 'payer_email' | 'payer_contact' | 'payment_method_label'>
): Promise<OrderRecord | null> {
  return await updateOrderFields(orderId, details);
}

/** Records the gateway order created for this order (id, currency and amount in minor units). */
export async function attachGatewayOrder(
  orderId: string,
  fields: Pick<OrderRecord, 'razorpay_order_id' | 'currency' | 'amount_minor'>
): Promise<OrderRecord | null> {
  return await updateOrderFields(orderId, { status: 'pending', ...fields });
}

/**
 * Atomically moves an order to 'completed'. Returns the updated order only for the caller that
 * performed the transition, and null if the order was already completed (or doesn't exist), so
 * the verify endpoint and the webhook can race without ever fulfilling the same order twice.
 */
export async function claimOrderCompletion(
  orderId: string,
  paymentDetails: { razorpay_order_id?: string; razorpay_payment_id?: string; razorpay_signature?: string }
): Promise<OrderRecord | null> {
  return await measureDbQuery('claimOrderCompletion', async () => {
    const collection = await ordersCollection();
    const result = await collection.findOneAndUpdate(
      { order_id: orderId, status: { $ne: 'completed' } },
      { $set: { status: 'completed', ...paymentDetails, updated_at: new Date().toISOString() } },
      { returnDocument: 'after' }
    );
    return (result as unknown as OrderRecord) || null;
  }, { order_id: orderId });
}
