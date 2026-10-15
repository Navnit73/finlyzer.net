import { NextRequest } from 'next/server';
import { createOrder, getOrderById, OrderRecord } from '@/lib/models/Order';
import { completeAndFulfillOrder } from '@/lib/fulfill-order';
import { startRazorpayCheckout, checkoutErrorStatus } from '@/lib/checkout-order';
import { verifyPaymentSignature, RazorpayConfigError } from '@/lib/razorpay';
import { errorResponse, successResponse, safeParseJson } from '@/lib/api-utils';
import { authorizeReconciliation, isReconciliationLocked } from '@/lib/reconciliation-access';

/**
 * POST /api/reconciliation/[id]/unlock
 * Starts the one-time Document Pass checkout for a guest reconciliation of 11-30 pages.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await authorizeReconciliation(req, id);
    if (access instanceof Response) return access;
    const { record } = access;

    if (!isReconciliationLocked(record)) {
      return successResponse({ already_unlocked: true, reconciliation_id: id });
    }
    // Never take payment for a run that failed or hasn't produced a report yet.
    if (record.status !== 'completed') {
      return errorResponse('The report is not ready yet, so there is nothing to unlock.', 409, 'NOT_READY');
    }

    // The reconciliation id is stored on the order so the Razorpay webhook can unlock it too.
    const order = await createOrder('guest', 'guest_doc_unlock', 'razorpay', { reconciliation_id: id });

    let checkout;
    try {
      checkout = await startRazorpayCheckout(order, `Unlock ${record.pages}-page bank reconciliation`);
    } catch (err) {
      return errorResponse((err as Error).message, checkoutErrorStatus(err), 'CHECKOUT_UNAVAILABLE');
    }

    const { _id, ...safeOrder } = order as unknown as { _id?: unknown } & OrderRecord;
    return successResponse({ success: true, order: safeOrder, checkout: { ...checkout, prefill: {} } });
  } catch (err) {
    return errorResponse((err as Error)?.message || 'Failed to start the unlock checkout.', 500);
  }
}

/**
 * PUT /api/reconciliation/[id]/unlock
 * Verifies the Razorpay signature and unlocks the reconciliation.
 */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const access = await authorizeReconciliation(req, id);
    if (access instanceof Response) return access;

    const { data: body, error: parseError } = await safeParseJson<{
      order_id?: string;
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    }>(req);
    if (parseError || !body) return errorResponse(parseError || 'Invalid request body', 400, 'BAD_REQUEST');

    const { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
    if (!order_id || typeof order_id !== 'string') return errorResponse('Valid order_id is required', 400, 'MISSING_ORDER_ID');

    const order = await getOrderById(order_id.trim());
    if (!order || order.plan_id !== 'guest_doc_unlock' || order.reconciliation_id !== id) {
      return errorResponse('Order not found', 404, 'NOT_FOUND');
    }

    if (order.status !== 'completed') {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return errorResponse('Missing required Razorpay payment verification parameters', 400, 'MISSING_PAYMENT_PROOF');
      }
      if (!order.razorpay_order_id || order.razorpay_order_id !== razorpay_order_id) {
        return errorResponse('Payment does not match this order', 400, 'ORDER_MISMATCH');
      }
      if (!verifyPaymentSignature({ razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, signature: razorpay_signature })) {
        return errorResponse('Payment signature verification failed.', 400, 'INVALID_SIGNATURE');
      }
      await completeAndFulfillOrder(order.order_id, { razorpay_order_id, razorpay_payment_id, razorpay_signature });
    }

    return successResponse({ success: true, reconciliation_id: id, is_paid: true });
  } catch (err) {
    if (err instanceof RazorpayConfigError) return errorResponse(err.message, 503, 'CHECKOUT_UNAVAILABLE');
    return errorResponse((err as Error)?.message || 'Failed to verify the payment.', 500);
  }
}
