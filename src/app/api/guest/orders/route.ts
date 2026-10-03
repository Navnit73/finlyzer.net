import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { createOrder, updateOrderStatus, getOrderById, OrderRecord } from '@/lib/models/Order';
import { getDocumentById, unlockGuestDocument } from '@/lib/models/Document';
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
      gateway?: OrderRecord['payment_gateway'];
    }>(req);

    if (parseError || !body) {
      return errorResponse(parseError || 'Invalid request payload', 400, 'BAD_REQUEST');
    }

    const { document_id, guest_session_id, gateway = 'razorpay' } = body;

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

    // Create Guest Unlock Order
    const order = await createOrder('guest', 'guest_doc_unlock', gateway);

    const orderPayload = {
      orderId: order.order_id,
      documentId: doc.id,
      amount: order.amount_usd,
      currency: 'USD',
      amount_usd: order.amount_usd,
      plan_name: 'Guest 11–30 Page Unlock',
      prefill: {
        name: 'Guest User',
        email: 'guest@finlyzers.com',
      },
      theme: {
        color: '#70F000',
      },
    };

    const { _id, ...safeOrder } = order as unknown as { _id?: unknown } & OrderRecord;
    return successResponse({
      success: true,
      order: safeOrder,
      payload: orderPayload,
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
      status?: OrderRecord['status'];
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    }>(req);

    if (parseError || !body) {
      return errorResponse(parseError || 'Invalid request body', 400, 'BAD_REQUEST');
    }

    const {
      order_id,
      document_id,
      status = 'completed',
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = body;

    if (!order_id || typeof order_id !== 'string') {
      return errorResponse('Valid order_id is required', 400, 'MISSING_ORDER_ID');
    }

    if (!document_id || typeof document_id !== 'string') {
      return errorResponse('Valid document_id is required', 400, 'MISSING_DOCUMENT_ID');
    }

    const existingOrder = await getOrderById(order_id.trim());
    if (!existingOrder) {
      return errorResponse('Order not found', 404, 'NOT_FOUND');
    }

    // Cryptographic Signature Verification for Razorpay
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    if (status === 'completed' && existingOrder.payment_gateway === 'razorpay') {
      if (razorpayKeySecret) {
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return errorResponse('Missing required Razorpay payment verification parameters', 400, 'MISSING_PAYMENT_PROOF');
        }

        const generatedSignature = crypto
          .createHmac('sha256', razorpayKeySecret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        if (generatedSignature !== razorpay_signature) {
          return errorResponse('Payment signature verification failed. Access denied.', 400, 'INVALID_SIGNATURE');
        }
      } else {
        if (!razorpay_payment_id) {
          return errorResponse('Payment confirmation details are required', 400, 'PAYMENT_ID_REQUIRED');
        }
      }
    }

    // Update order status
    const updatedOrder = await updateOrderStatus(order_id, status, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!updatedOrder) {
      return errorResponse('Order update failed', 500);
    }

    // Atomically unlock document
    const unlockedDoc = await unlockGuestDocument(document_id.trim(), order_id.trim());

    return successResponse({
      success: true,
      order: updatedOrder,
      document_id: document_id.trim(),
      is_paid: true,
      message: 'Payment verified successfully! Document downloads are now unlocked.',
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to verify guest payment', 500);
  }
}
