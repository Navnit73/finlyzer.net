import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createOrder, updateOrderStatus, getUserOrders, getOrderById, PRICING_PLANS, OrderRecord } from '@/lib/models/Order';
import { addPurchasedPages, getUserQuota } from '@/lib/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await getUserOrders(session.user.email);
    const sanitizedOrders = orders.map(({ _id, ...rest }: { _id?: unknown } & OrderRecord) => rest);
    return NextResponse.json({ orders: sanitizedOrders });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { plan_id, gateway = 'razorpay' } = body;

    const plan = PRICING_PLANS.find((p) => p.id === plan_id);
    if (!plan) {
      return NextResponse.json({ error: 'Invalid pricing plan selected' }, { status: 400 });
    }

    // 1. Create DB order record (initial status: created)
    const order = await createOrder(session.user.email, plan.id, gateway);

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
    return NextResponse.json({
      success: true,
      order: safeOrder,
      payload: orderPayload,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const normalizedUserEmail = session.user.email.toLowerCase().trim();
    const body = await req.json();
    const {
      order_id,
      status = 'completed',
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 });
    }

    // 1. Ownership & Existence Verification BEFORE any state modification
    const existingOrder = await getOrderById(order_id);
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (existingOrder.user_email !== normalizedUserEmail) {
      return NextResponse.json({ error: 'Unauthorized: Order belongs to another account' }, { status: 403 });
    }

    // 2. Prevent Replay Attack / Double Crediting
    if (existingOrder.status === 'completed') {
      const freshQuota = await getUserQuota(session.user.email);
      const { _id, ...safeOrder } = existingOrder as unknown as { _id?: unknown } & OrderRecord;
      return NextResponse.json({
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
          return NextResponse.json(
            { error: 'Missing required Razorpay payment verification parameters' },
            { status: 400 }
          );
        }

        const generatedSignature = crypto
          .createHmac('sha256', razorpayKeySecret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        if (generatedSignature !== razorpay_signature) {
          console.error(`[SECURITY ALERT] Invalid payment signature for order ${order_id}`);
          return NextResponse.json(
            { error: 'Payment signature verification failed. Access denied.' },
            { status: 400 }
          );
        }
      } else {
        // In development/mock mode without secret, require at least mock payment id
        if (!razorpay_payment_id) {
          return NextResponse.json(
            { error: 'Payment confirmation details are required' },
            { status: 400 }
          );
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
      return NextResponse.json({ error: 'Order update failed' }, { status: 500 });
    }

    // 5. Secure Credit Allocation only after strict verification
    if (status === 'completed' && updatedOrder.pages_credited > 0) {
      const plan = PRICING_PLANS.find((p) => p.id === updatedOrder.plan_id);
      const newTier = plan?.id === 'pack_100' ? 'enterprise' : plan?.id === 'pack_50' ? 'pro' : undefined;
      await addPurchasedPages(session.user.email, updatedOrder.pages_credited, newTier);
    }

    const freshQuota = await getUserQuota(session.user.email);
    const { _id, ...safeOrder } = updatedOrder as unknown as { _id?: unknown } & OrderRecord;

    return NextResponse.json({
      success: true,
      order: safeOrder,
      quota: freshQuota,
      message: `Order ${order_id} verified and updated to ${status}.`,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
