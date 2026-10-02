import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createOrder, getUserOrders, PRICING_PLANS, PricingPlan } from '@/lib/models/Order';
import { addPurchasedPages } from '@/lib/models/User';

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

    // Create DB order record
    const order = await createOrder(session.user.email, plan.id, gateway);

    // Razorpay Payload / Order configuration ready for frontend SDK
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
      message: `Order for ${plan.name} initialized successfully.`,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
  }
}
