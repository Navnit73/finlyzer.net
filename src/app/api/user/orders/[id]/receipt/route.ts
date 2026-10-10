import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserOrders } from '@/lib/models/Order';
import { generateInvoicePdf } from '@/lib/pdf/invoice-generator';
import { ensurePayerDetails } from '@/lib/fulfill-order';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to download invoice receipts.' }, { status: 401 });
    }

    const { id: orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Retrieve specific order directly via indexed lookup
    const { getOrderById } = await import('@/lib/models/Order');
    const order = await getOrderById(orderId);

    if (!order || order.user_email !== session.user.email.toLowerCase().trim()) {
      return NextResponse.json({ error: 'Invoice record not found' }, { status: 404 });
    }

    // Only paid orders get a tax invoice; unpaid/abandoned checkouts must not produce one.
    if (order.status !== 'completed') {
      return NextResponse.json({ error: 'Invoice is only available for completed payments' }, { status: 409 });
    }

    // Generate real PDF receipt with pdf-lib
    // Payer details come from Razorpay (this also backfills older orders); the account name is the fallback.
    const paidOrder = await ensurePayerDetails(order);
    const pdfBytes = await generateInvoicePdf(paidOrder, session.user.name || undefined);

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Finlyzers_Invoice_${order.order_id}.pdf"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { error: error.message || 'Failed to generate PDF invoice receipt' },
      { status: 500 }
    );
  }
}
