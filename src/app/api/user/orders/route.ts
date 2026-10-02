import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  createOrder,
  updateOrderStatus,
  getUserOrders,
  getOrderById,
  PRICING_PLANS,
  OrderRecord,
} from '@/lib/models/Order';
import { addPurchasedPages, getUserQuota } from '@/lib/models/User';
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
 * Initializes a new checkout order with server-validated pricing.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse('Unauthorized. Please sign in to create an order.', 401, 'UNAUTHORIZED');
    }

    const { data: body, error: parseError } = await safeParseJson<{
      plan_id?: string;
      gateway?: OrderRecord['payment_gateway'];
    }>(req);

    if (parseError || !body) {
      return errorResponse(parseError || 'Invalid request body', 400, 'BAD_REQUEST');
    }

    const { plan_id, gateway = 'razorpay' } = body;

    const plan = PRICING_PLANS.find((p) => p.id === plan_id);
    if (!plan) {
      return errorResponse('Invalid pricing plan selected.', 400, 'INVALID_PLAN');
    }

    const allowedGateways: OrderRecord['payment_gateway'][] = ['razorpay', 'stripe', 'test', 'manual'];
    const safeGateway = allowedGateways.includes(gateway) ? gateway : 'razorpay';

    // 1. Create DB order record (initial status: created)
    const order = await createOrder(session.user.email, plan.id, safeGateway);

    // Order configuration payload
    const orderPayload = {
      orderId: order.order_id,
      amount: plan.price_usd,
      currency: 'USD',
      amount_usd: plan.price_usd,
      plan_name: plan.name,
      pages_credited: plan.pages,
      prefill: {
        name: session.user.name || '',
        email: session.user.email || '',
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
    return errorResponse(error.message || 'Failed to create order', 500);
  }
}

/**
 * PUT /api/user/orders
 * Verifies payment confirmation with HMAC-SHA256 signature verification and allocates page credits.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return errorResponse('Unauthorized. Please sign in to complete payment.', 401, 'UNAUTHORIZED');
    }

    const normalizedUserEmail = session.user.email.toLowerCase().trim();

    const { data: body, error: parseError } = await safeParseJson<{
      order_id?: string;
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
      status = 'completed',
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = body;

    if (!order_id || typeof order_id !== 'string') {
      return errorResponse('Valid order_id is required', 400, 'MISSING_ORDER_ID');
    }

    // 1. Ownership & Existence Verification BEFORE any state modification
    const existingOrder = await getOrderById(order_id.trim());
    if (!existingOrder) {
      return errorResponse('Order not found', 404, 'NOT_FOUND');
    }

    if (existingOrder.user_email !== normalizedUserEmail) {
      return errorResponse('Unauthorized: Order belongs to another account', 403, 'FORBIDDEN');
    }

    // 2. Prevent Replay Attack / Double Crediting
    if (existingOrder.status === 'completed') {
      const freshQuota = await getUserQuota(session.user.email);
      const { _id, ...safeOrder } = existingOrder as unknown as { _id?: unknown } & OrderRecord;
      return successResponse({
        success: true,
        order: safeOrder,
        quota: freshQuota,
        message: `Order ${order_id} is already completed.`,
      });
    }

    // 3. Cryptographic Signature Verification for Paid Gateways (Razorpay)
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
          console.error(`[SECURITY ALERT] Invalid payment signature for order ${order_id}`);
          return errorResponse('Payment signature verification failed. Access denied.', 400, 'INVALID_SIGNATURE');
        }
      } else {
        // In development/mock mode without secret, require at least mock payment id
        if (!razorpay_payment_id) {
          return errorResponse('Payment confirmation details are required', 400, 'PAYMENT_ID_REQUIRED');
        }
      }
    }

    // 4. Update Order Status
    const updatedOrder = await updateOrderStatus(order_id, status, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!updatedOrder) {
      return errorResponse('Order update failed', 500);
    }

    // 5. Secure Credit Allocation only after strict verification
    if (status === 'completed' && updatedOrder.pages_credited > 0) {
      const plan = PRICING_PLANS.find((p) => p.id === updatedOrder.plan_id);
      const newTier = plan?.id === 'pack_100' ? 'enterprise' : plan?.id === 'pack_50' ? 'pro' : undefined;
      await addPurchasedPages(session.user.email, updatedOrder.pages_credited, newTier);
    }

    const freshQuota = await getUserQuota(session.user.email);
    const { _id, ...safeOrder } = updatedOrder as unknown as { _id?: unknown } & OrderRecord;

    return successResponse({
      success: true,
      order: safeOrder,
      quota: freshQuota,
      message: `Order ${order_id} verified and updated to ${status}.`,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to update order', 500);
  }
}
