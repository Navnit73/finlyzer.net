import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createOrder, updateOrderStatus, getUserOrders, PRICING_PLANS } from '@/lib/models/Order';
import { addPurchasedPages, getUserQuota } from '@/lib/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orders = await getUserOrders(session.user.email);
    return NextResponse.json({ orders });
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

    // Razorpay Payload / Order configuration
    const razorpayPayload = {
      orderId: order.order_id,
      amount: plan.price_inr * 100, // in paise
      currency: 'INR',
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

    return NextResponse.json({
      success: true,
      order,
      razorpay: razorpayPayload,
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

    const updatedOrder = await updateOrderStatus(order_id, status, {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!updatedOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify ownership
    if (updatedOrder.user_email !== session.user.email.toLowerCase().trim()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If order was marked completed, ensure pages are credited
    if (status === 'completed' && updatedOrder.pages_credited > 0) {
      const plan = PRICING_PLANS.find((p) => p.id === updatedOrder.plan_id);
      const newTier = plan?.id === 'pack_100' ? 'enterprise' : plan?.id === 'pack_50' ? 'pro' : undefined;
      await addPurchasedPages(session.user.email, updatedOrder.pages_credited, newTier);
    }

    const freshQuota = await getUserQuota(session.user.email);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      quota: freshQuota,
      message: `Order ${order_id} verified and updated to ${status}.`,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}
