import { claimOrderCompletion, updateOrderStatus, setOrderPayerDetails, OrderRecord } from '@/lib/models/Order';
import { addPurchasedPages, getUserQuota } from '@/lib/models/User';
import { unlockGuestDocument } from '@/lib/models/Document';
import { fetchPayerDetails } from '@/lib/razorpay';
import { sendCreditPurchaseEmail } from '@/lib/email';

/**
 * Marks a paid order completed and delivers what was bought (page credits or a guest document
 * unlock). Safe to call from both the browser verify endpoint and the Razorpay webhook: only the
 * first caller to flip the order to 'completed' fulfils it, later callers get `fulfilled: false`.
 */
export async function completeAndFulfillOrder(
  orderId: string,
  payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature?: string }
): Promise<{ fulfilled: boolean; order: OrderRecord | null }> {
  const order = await claimOrderCompletion(orderId, payment);
  if (!order) return { fulfilled: false, order: null };

  let purchaseEmail: { name?: string | null } | null = null;
  try {
    if (order.plan_id === 'guest_doc_unlock') {
      if (order.document_id) await unlockGuestDocument(order.document_id, order.order_id);
    } else if (order.pages_credited > 0) {
      const tier = order.plan_id === 'pack_100' ? 'enterprise' : order.plan_id === 'pack_50' ? 'pro' : undefined;
      const user = await addPurchasedPages(order.user_email, order.pages_credited, tier);
      purchaseEmail = { name: user.name };
    }
  } catch (err) {
    // Re-open the order so a webhook retry or the browser verify call can fulfil it again.
    await updateOrderStatus(order.order_id, 'pending');
    throw err;
  }

  // Best effort and after fulfilment: a Razorpay lookup problem must never affect the order.
  const payer = await ensurePayerDetails({ ...order, razorpay_payment_id: payment.razorpay_payment_id });

  if (purchaseEmail) {
    // Runs only for the caller that fulfilled the order, so the customer gets exactly one email.
    // Credits are already granted, so an email problem must not turn this into a failed payment.
    try {
      const quota = await getUserQuota(order.user_email);
      await sendCreditPurchaseEmail({
        to: order.user_email,
        name: payer.payer_name || purchaseEmail.name,
        orderId: order.order_id,
        planName: order.plan_name,
        pagesAdded: order.pages_credited,
        amountMinor: order.amount_minor ?? Math.round(order.amount_usd * 100),
        currency: order.currency || 'USD',
        paymentId: payment.razorpay_payment_id,
        totalCredits: quota.freePagesRemaining,
      });
    } catch (err) {
      console.error('[Fulfil] Purchase email failed:', (err as Error).message);
    }
  }

  return { fulfilled: true, order };
}

/**
 * Returns the order with the payer's details from Razorpay (name, email, phone, payment method),
 * fetching and saving them the first time. Also backfills orders paid before this existed.
 */
export async function ensurePayerDetails(order: OrderRecord): Promise<OrderRecord> {
  if (order.payer_email || order.payer_name || order.payment_method_label) return order;
  if (!order.razorpay_payment_id) return order;
  const details = await fetchPayerDetails(order.razorpay_payment_id);
  if (!details) return order;
  const saved = await setOrderPayerDetails(order.order_id, details).catch(() => null);
  return saved ?? { ...order, ...details };
}
