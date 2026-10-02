import { getDatabase } from '../mongodb';
import { PricingPlan, OrderRecord, PRICING_PLANS } from '@/types/pricing';

export type { PricingPlan, OrderRecord };
export { PRICING_PLANS };

// In-memory fallback
const memoryOrders = new Map<string, OrderRecord>();

export async function createOrder(
  userEmail: string,
  planId: PricingPlan['id'],
  gateway: OrderRecord['payment_gateway'] = 'razorpay'
): Promise<OrderRecord> {
  const normalizedEmail = userEmail.toLowerCase().trim();
  const plan = PRICING_PLANS.find((p) => p.id === planId) || PRICING_PLANS[0];

  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const orderRecord: OrderRecord = {
    order_id: orderId,
    user_email: normalizedEmail,
    plan_id: plan.id,
    plan_name: plan.name,
    amount_usd: plan.price_usd,
    amount_inr: plan.price_inr,
    pages_credited: plan.pages,
    status: 'created',
    payment_gateway: gateway,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const db = await getDatabase();
    if (db) {
      const collection = db.collection<OrderRecord>('orders');
      await collection.insertOne(orderRecord as unknown as import('mongodb').OptionalUnlessRequiredId<OrderRecord>);
      return orderRecord;
    }
  } catch (err) {
    console.warn('⚠️ MongoDB createOrder fallback to memory:', (err as Error).message);
  }

  memoryOrders.set(orderId, orderRecord);
  return orderRecord;
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
  const updateFields: Partial<OrderRecord> = {
    status,
    updated_at: new Date().toISOString(),
    ...(paymentDetails || {}),
  };

  try {
    const db = await getDatabase();
    if (db) {
      const collection = db.collection<OrderRecord>('orders');
      const result = await collection.findOneAndUpdate(
        { order_id: orderId },
        { $set: updateFields },
        { returnDocument: 'after' }
      );
      if (result) return result as unknown as OrderRecord;
    }
  } catch (err) {
    console.warn('⚠️ MongoDB updateOrderStatus fallback to memory:', (err as Error).message);
  }

  const existing = memoryOrders.get(orderId);
  if (existing) {
    const updated = { ...existing, ...updateFields };
    memoryOrders.set(orderId, updated);
    return updated;
  }
  return null;
}

export async function getUserOrders(userEmail: string): Promise<OrderRecord[]> {
  const normalizedEmail = userEmail.toLowerCase().trim();
  try {
    const db = await getDatabase();
    if (db) {
      const collection = db.collection<OrderRecord>('orders');
      return await collection
        .find({ user_email: normalizedEmail })
        .sort({ created_at: -1 })
        .toArray();
    }
  } catch (err) {
    console.warn('⚠️ MongoDB getUserOrders fallback to memory:', (err as Error).message);
  }

  const results: OrderRecord[] = [];
  for (const order of memoryOrders.values()) {
    if (order.user_email === normalizedEmail) {
      results.push(order);
    }
  }
  return results.sort((a, b) => b.created_at.localeCompare(a.created_at));
}
