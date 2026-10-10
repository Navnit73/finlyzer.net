import { attachGatewayOrder, OrderRecord } from '@/lib/models/Order';
import {
  createRazorpayOrder,
  getChargeAmountMinor,
  getChargeCurrency,
  getRazorpayKeys,
  RazorpayConfigError,
} from '@/lib/razorpay';

/**
 * Creates the Razorpay order for one of our orders and returns the options the browser needs to
 * open Checkout. The amount always comes from the server-side order, never from the client.
 */
export async function startRazorpayCheckout(order: OrderRecord, description: string) {
  const { keyId } = getRazorpayKeys();
  const currency = getChargeCurrency();
  const amountMinor = getChargeAmountMinor(order, currency);

  const rzpOrder = await createRazorpayOrder({
    amountMinor,
    currency,
    receipt: order.order_id,
    // The webhook resolves our order from this.
    notes: { order_id: order.order_id, plan_id: order.plan_id },
  });

  await attachGatewayOrder(order.order_id, {
    razorpay_order_id: rzpOrder.id,
    currency,
    amount_minor: amountMinor,
  });

  return {
    key: keyId,
    razorpay_order_id: rzpOrder.id,
    amount: amountMinor,
    currency,
    name: 'Finlyzers',
    description,
  };
}

/** Maps a thrown checkout error to an API status code. */
export function checkoutErrorStatus(err: unknown): number {
  return err instanceof RazorpayConfigError ? 503 : 502;
}
