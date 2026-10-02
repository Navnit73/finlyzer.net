import crypto from 'crypto';
import { getDatabase } from '../mongodb';
import { PricingPlan, OrderRecord, PRICING_PLANS } from '@/types/pricing';
import { measureDbQuery } from '../db-logger';

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

  const uniqueSuffix = crypto.randomBytes(6).toString('hex');
  const orderId = `order_${Date.now()}_${uniqueSuffix}`;
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
    created_at: now,
    updated_at: now,
  };

  return await measureDbQuery('createOrder', async () => {
    try {
      const db = await getDatabase();
      if (db) {
        const collection = db.collection<OrderRecord>('orders');
        await collection.insertOne(
          orderRecord as unknown as import('mongodb').OptionalUnlessRequiredId<OrderRecord>
        );
        return orderRecord;
      }
    } catch (err) {
      console.warn('⚠️ MongoDB createOrder fallback to memory:', (err as Error).message);
    }

    memoryOrders.set(orderId, orderRecord);
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
  const updateFields: Partial<OrderRecord> = {
    status,
    updated_at: new Date().toISOString(),
    ...(paymentDetails || {}),
  };

  return await measureDbQuery('updateOrderStatus', async () => {
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
  }, { order_id: orderId, status });
}

export async function getOrderById(orderId: string): Promise<OrderRecord | null> {
  return await measureDbQuery('getOrderById', async () => {
    try {
      const db = await getDatabase();
      if (db) {
        const collection = db.collection<OrderRecord>('orders');
        const order = await collection.findOne({ order_id: orderId });
        if (order) return order as unknown as OrderRecord;
      }
    } catch (err) {
      console.warn('⚠️ MongoDB getOrderById fallback to memory:', (err as Error).message);
    }

    return memoryOrders.get(orderId) || null;
  }, { order_id: orderId });
}

export async function getUserOrders(userEmail: string): Promise<OrderRecord[]> {
  const normalizedEmail = userEmail.toLowerCase().trim();

  return await measureDbQuery('getUserOrders', async () => {
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
  }, { user_email: normalizedEmail });
}

export async function deleteAllUserOrders(userEmail: string): Promise<number> {
  const normalizedEmail = userEmail.toLowerCase().trim();

  return await measureDbQuery('deleteAllUserOrders', async () => {
    try {
      const db = await getDatabase();
      if (db) {
        const collection = db.collection<OrderRecord>('orders');
        const result = await collection.deleteMany({ user_email: normalizedEmail });
        return result.deletedCount;
      }
    } catch (err) {
      console.warn('⚠️ MongoDB deleteAllUserOrders fallback to memory:', (err as Error).message);
    }

    let count = 0;
    for (const [orderId, order] of memoryOrders.entries()) {
      if (order.user_email === normalizedEmail) {
        memoryOrders.delete(orderId);
        count++;
      }
    }
    return count;
  }, { user_email: normalizedEmail });
}
