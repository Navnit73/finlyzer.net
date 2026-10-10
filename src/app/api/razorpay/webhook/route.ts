import { NextRequest } from 'next/server';
import { getOrderById, getOrderByRazorpayOrderId, OrderRecord } from '@/lib/models/Order';
import { completeAndFulfillOrder } from '@/lib/fulfill-order';
import { verifyWebhookSignature, RazorpayConfigError } from '@/lib/razorpay';
import { errorResponse, successResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

interface RazorpayPaymentEntity {
  id: string;
  order_id?: string;
  amount: number;
  currency: string;
  status: string;
  notes?: Record<string, string> | unknown[];
}

interface RazorpayWebhookPayload {
  event: string;
  payload?: {
    payment?: { entity?: RazorpayPaymentEntity };
    order?: { entity?: { id: string; notes?: Record<string, string> | unknown[] } };
  };
}

async function resolveOrder(
  razorpayOrderId: string | undefined,
  notes: Record<string, string> | unknown[] | undefined
): Promise<OrderRecord | null> {
  if (razorpayOrderId) {
    const byGatewayId = await getOrderByRazorpayOrderId(razorpayOrderId);
    if (byGatewayId) return byGatewayId;
  }
  const orderId = notes && !Array.isArray(notes) ? notes.order_id : undefined;
  return orderId ? getOrderById(orderId) : null;
}

/**
 * POST /api/razorpay/webhook
 * Razorpay server-to-server notifications. Configure in Dashboard > Webhooks with the events
 * `payment.captured`, `order.paid` and `payment.failed`, and the same secret as RAZORPAY_WEBHOOK_SECRET.
 * This guarantees credits are granted even if the customer closes the tab before the browser
 * verification request is sent. Retries are expected, so every handler is idempotent.
 */
export async function POST(req: NextRequest) {
  // The signature is computed over the exact raw body, so read text before any JSON parsing.
  const rawBody = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature) {
    return errorResponse('Missing x-razorpay-signature header', 401, 'MISSING_SIGNATURE');
  }

  try {
    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error('[Razorpay Webhook] Invalid signature');
      return errorResponse('Invalid signature', 400, 'INVALID_SIGNATURE');
    }
  } catch (err) {
    if (err instanceof RazorpayConfigError) {
      console.error('[Razorpay Webhook]', err.message);
      return errorResponse('Webhook not configured', 503, 'NOT_CONFIGURED');
    }
    throw err;
  }

  let event: RazorpayWebhookPayload;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return errorResponse('Invalid JSON payload', 400, 'BAD_REQUEST');
  }

  try {
    const payment = event.payload?.payment?.entity;
    const gatewayOrder = event.payload?.order?.entity;

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      if (!payment) return successResponse({ received: true, ignored: 'no payment entity' });

      const order = await resolveOrder(payment.order_id ?? gatewayOrder?.id, payment.notes ?? gatewayOrder?.notes);
      if (!order) {
        // Not one of ours (or a different product on the same account): ack so Razorpay stops retrying.
        console.warn(`[Razorpay Webhook] No order found for payment ${payment.id}`);
        return successResponse({ received: true, ignored: 'unknown order' });
      }

      // Never fulfil on a payment that doesn't match what we asked to charge.
      if (
        !order.razorpay_order_id ||
        order.razorpay_order_id !== payment.order_id ||
        order.amount_minor !== payment.amount ||
        order.currency !== payment.currency
      ) {
        console.error(`[SECURITY ALERT] Webhook payment ${payment.id} does not match order ${order.order_id}`);
        return successResponse({ received: true, ignored: 'mismatch' });
      }

      const { fulfilled } = await completeAndFulfillOrder(order.order_id, {
        razorpay_order_id: payment.order_id,
        razorpay_payment_id: payment.id,
      });
      return successResponse({ received: true, fulfilled });
    }

    // payment.failed is informational: the customer can retry on the same Razorpay order, so the
    // order stays open and any later successful attempt will still complete it.
    if (event.event === 'payment.failed' && payment) {
      console.warn(`[Razorpay Webhook] Payment ${payment.id} failed for order ${payment.order_id}`);
    }

    return successResponse({ received: true });
  } catch (err) {
    // 5xx makes Razorpay retry the delivery.
    console.error('[Razorpay Webhook] Processing error:', err);
    return errorResponse('Webhook processing failed', 500);
  }
}
