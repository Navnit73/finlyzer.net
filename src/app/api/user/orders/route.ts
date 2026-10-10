import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createOrder, getUserOrders, getOrderById, PRICING_PLANS, OrderRecord } from '@/lib/models/Order';
import { getUserQuota } from '@/lib/models/User';
import { completeAndFulfillOrder } from '@/lib/fulfill-order';
import { startRazorpayCheckout, checkoutErrorStatus } from '@/lib/checkout-order';
import { verifyPaymentSignature, RazorpayConfigError } from '@/lib/razorpay';
import { errorResponse, successResponse, safeParseJson } from '@/lib/api-utils';

/**
 * GET /api/user/orders
 * Returns all billing orders and invoice records for the authenticated user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse('Unauthorized. Please sign in to view billing history.', 401, 'UNAUTHORIZED');
    }

    const orders = await getUserOrders(session.user.email);
    const sanitizedOrders = orders.map(({ _id, ...rest }: { _id?: unknown } & OrderRecord) => rest);
    return successResponse({ orders: sanitizedOrders });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to fetch billing orders', 500);
  }
}

/**
 * POST /api/user/orders
 * Creates our order record plus the matching Razorpay order (server-validated pricing) and
 * returns the options needed to open Razorpay Checkout.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse('Unauthorized. Please sign in to create an order.', 401, 'UNAUTHORIZED');
    }

    const { data: body, error: parseError } = await safeParseJson<{ plan_id?: string }>(req);
    if (parseError || !body) {
      return errorResponse(parseError || 'Invalid request body', 400, 'BAD_REQUEST');
    }

    // Guest passes are sold through /api/guest/orders and are not account credit packs.
    const plan = PRICING_PLANS.find((p) => p.id === body.plan_id && p.id !== 'guest_doc_unlock');
    if (!plan) {
      return errorResponse('Invalid pricing plan selected.', 400, 'INVALID_PLAN');
    }

    const order = await createOrder(session.user.email, plan.id, 'razorpay');

    let checkout;
    try {
      checkout = await startRazorpayCheckout(order, `${plan.name} - ${plan.pages.toLocaleString()} pages`);
    } catch (err) {
      return errorResponse((err as Error).message, checkoutErrorStatus(err), 'CHECKOUT_UNAVAILABLE');
    }

    const { _id, ...safeOrder } = order as unknown as { _id?: unknown } & OrderRecord;
    return successResponse({
      success: true,
      order: safeOrder,
      checkout: {
        ...checkout,
        prefill: { name: session.user.name || '', email: session.user.email },
      },
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to create order', 500);
  }
}

/**
 * PUT /api/user/orders
 * Verifies the Checkout success response (HMAC-SHA256 signature) and credits the purchased pages.
 * Credits are granted at most once per order; the Razorpay webhook is the backstop if this
 * request never arrives (closed tab, lost connection).
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse('Unauthorized. Please sign in to complete payment.', 401, 'UNAUTHORIZED');
    }

    const { data: body, error: parseError } = await safeParseJson<{
      order_id?: string;
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    }>(req);
    if (parseError || !body) {
      return errorResponse(parseError || 'Invalid request body', 400, 'BAD_REQUEST');
    }

    const { order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
    if (!order_id || typeof order_id !== 'string') {
      return errorResponse('Valid order_id is required', 400, 'MISSING_ORDER_ID');
    }

    const existingOrder = await getOrderById(order_id.trim());
    if (!existingOrder) {
      return errorResponse('Order not found', 404, 'NOT_FOUND');
    }
    if (existingOrder.user_email !== session.user.email.toLowerCase().trim()) {
      return errorResponse('Unauthorized: Order belongs to another account', 403, 'FORBIDDEN');
    }

    if (existingOrder.status !== 'completed') {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return errorResponse('Missing required Razorpay payment verification parameters', 400, 'MISSING_PAYMENT_PROOF');
      }
      // The Razorpay order id must be the one we created for this order, not whatever the client sent.
      if (!existingOrder.razorpay_order_id || existingOrder.razorpay_order_id !== razorpay_order_id) {
        return errorResponse('Payment does not match this order', 400, 'ORDER_MISMATCH');
      }
      if (!verifyPaymentSignature({ razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, signature: razorpay_signature })) {
        console.error(`[SECURITY ALERT] Invalid payment signature for order ${order_id}`);
        return errorResponse('Payment signature verification failed.', 400, 'INVALID_SIGNATURE');
      }

      await completeAndFulfillOrder(existingOrder.order_id, {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
    }

    const [order, quota] = await Promise.all([getOrderById(existingOrder.order_id), getUserQuota(session.user.email)]);
    const { _id, ...safeOrder } = (order || existingOrder) as unknown as { _id?: unknown } & OrderRecord;
    return successResponse({ success: true, order: safeOrder, quota, message: `Order ${order_id} verified.` });
  } catch (err: unknown) {
    if (err instanceof RazorpayConfigError) return errorResponse(err.message, 503, 'CHECKOUT_UNAVAILABLE');
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to update order', 500);
  }
}
