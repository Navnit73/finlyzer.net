import { NextRequest } from 'next/server';
import { createOrder, getOrderById, OrderRecord } from '@/lib/models/Order';
import { getDocumentById } from '@/lib/models/Document';
import { completeAndFulfillOrder } from '@/lib/fulfill-order';
import { startRazorpayCheckout, checkoutErrorStatus } from '@/lib/checkout-order';
import { verifyPaymentSignature, RazorpayConfigError } from '@/lib/razorpay';
import { errorResponse, successResponse, safeParseJson } from '@/lib/api-utils';

/**
 * POST /api/guest/orders
 * Creates an instant guest unlock checkout order ($10) for an 11-30 page document.
 */
export async function POST(req: NextRequest) {
  try {
    const { data: body, error: parseError } = await safeParseJson<{
      document_id?: string;
      guest_session_id?: string;
    }>(req);

    if (parseError || !body) {
      return errorResponse(parseError || 'Invalid request payload', 400, 'BAD_REQUEST');
    }

    const { document_id } = body;

    if (!document_id || typeof document_id !== 'string') {
      return errorResponse('Valid document_id is required to create a guest unlock order.', 400, 'MISSING_DOCUMENT_ID');
    }

    // Verify guest document exists
    const doc = await getDocumentById(document_id.trim());
    if (!doc) {
      return errorResponse('Document not found.', 404, 'NOT_FOUND');
    }

    if (doc.pages > 30) {
      return errorResponse(
        'Documents over 30 pages require a registered account. Please sign in with Google.',
        403,
        'LOGIN_REQUIRED'
      );
    }

    // If already paid or <= 10 pages, no purchase needed
    if (doc.is_paid || doc.pages <= 10) {
      return successResponse({
        already_unlocked: true,
        message: 'This document is already unlocked and eligible for free downloads.',
        document_id: doc.id,
      });
    }

    // Create Guest Unlock Order; the document id is stored so the webhook can unlock it too.
    const order = await createOrder('guest', 'guest_doc_unlock', 'razorpay', { document_id: doc.id });

    let checkout;
    try {
      checkout = await startRazorpayCheckout(order, `Unlock ${doc.pages}-page statement export`);
    } catch (err) {
      return errorResponse((err as Error).message, checkoutErrorStatus(err), 'CHECKOUT_UNAVAILABLE');
    }

    const { _id, ...safeOrder } = order as unknown as { _id?: unknown } & OrderRecord;
    return successResponse({
      success: true,
      order: safeOrder,
      document_id: doc.id,
      checkout: { ...checkout, prefill: {} },
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to initialize guest unlock order', 500);
  }
}

/**
 * PUT /api/guest/orders
 * Verifies Razorpay HMAC-SHA256 signature for guest unlock payment and marks document as paid.
 */
export async function PUT(req: NextRequest) {
  try {
    const { data: body, error: parseError } = await safeParseJson<{
      order_id?: string;
      document_id?: string;
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    }>(req);

    if (parseError || !body) {
      return errorResponse(parseError || 'Invalid request body', 400, 'BAD_REQUEST');
    }

    const { order_id, document_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!order_id || typeof order_id !== 'string') {
      return errorResponse('Valid order_id is required', 400, 'MISSING_ORDER_ID');
    }
    if (!document_id || typeof document_id !== 'string') {
      return errorResponse('Valid document_id is required', 400, 'MISSING_DOCUMENT_ID');
    }

    const existingOrder = await getOrderById(order_id.trim());
    if (!existingOrder || existingOrder.plan_id !== 'guest_doc_unlock') {
      return errorResponse('Order not found', 404, 'NOT_FOUND');
    }
    if (existingOrder.document_id !== document_id.trim()) {
      return errorResponse('Order does not belong to this document', 403, 'FORBIDDEN');
    }

    if (existingOrder.status !== 'completed') {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return errorResponse('Missing required Razorpay payment verification parameters', 400, 'MISSING_PAYMENT_PROOF');
      }
      if (!existingOrder.razorpay_order_id || existingOrder.razorpay_order_id !== razorpay_order_id) {
        return errorResponse('Payment does not match this order', 400, 'ORDER_MISMATCH');
      }
      if (!verifyPaymentSignature({ razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, signature: razorpay_signature })) {
        return errorResponse('Payment signature verification failed.', 400, 'INVALID_SIGNATURE');
      }

      await completeAndFulfillOrder(existingOrder.order_id, {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
    }

    return successResponse({
      success: true,
      document_id: document_id.trim(),
      is_paid: true,
      message: 'Payment verified successfully! Document downloads are now unlocked.',
    });
  } catch (err: unknown) {
    if (err instanceof RazorpayConfigError) return errorResponse(err.message, 503, 'CHECKOUT_UNAVAILABLE');
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to verify guest payment', 500);
  }
}
