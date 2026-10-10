import crypto from 'crypto';
import { OrderRecord } from '@/types/pricing';

const RAZORPAY_API = 'https://api.razorpay.com/v1';

export interface RazorpayOrder {
  id: string;
  amount: number;
  amount_paid: number;
  currency: string;
  status: 'created' | 'attempted' | 'paid';
  receipt?: string;
  notes?: Record<string, string>;
}

export class RazorpayConfigError extends Error {}

export function getRazorpayKeys(): { keyId: string; keySecret: string } {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new RazorpayConfigError('Online payments are not configured yet. Please try again later.');
  }
  return { keyId, keySecret };
}

/** The currency orders are charged in. Defaults to USD to match the displayed prices. */
export function getChargeCurrency(): 'USD' | 'INR' {
  return process.env.RAZORPAY_CURRENCY?.toUpperCase() === 'INR' ? 'INR' : 'USD';
}

/**
 * Amount in the currency's smallest unit (cents / paise). RAZORPAY_TEST_AMOUNT (major units, e.g.
 * 1 for $1) overrides the price of every plan so the flow can be tested cheaply. Credits granted
 * are unchanged, so never set it in production.
 */
export function getChargeAmountMinor(order: Pick<OrderRecord, 'amount_usd' | 'amount_inr'>, currency: string): number {
  const override = Number(process.env.RAZORPAY_TEST_AMOUNT);
  if (Number.isFinite(override) && override > 0) {
    console.warn(`[Razorpay] RAZORPAY_TEST_AMOUNT is set: charging ${override} ${currency} regardless of plan price`);
    return Math.round(override * 100);
  }
  const major = currency === 'INR' ? order.amount_inr ?? order.amount_usd * 83 : order.amount_usd;
  return Math.round(major * 100);
}

/** Creates the Razorpay order the Checkout widget pays against (server-side only). */
export async function createRazorpayOrder(params: {
  amountMinor: number;
  currency: string;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrder> {
  const { keyId, keySecret } = getRazorpayKeys();
  const res = await fetch(`${RAZORPAY_API}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
    },
    body: JSON.stringify({
      amount: params.amountMinor,
      currency: params.currency,
      // Razorpay caps receipt at 40 characters.
      receipt: params.receipt.slice(0, 40),
      notes: params.notes,
    }),
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.id) {
    console.error('[Razorpay] Order creation failed:', data?.error || res.status);
    throw new Error(data?.error?.description || 'Could not start the payment. Please try again.');
  }
  return data as RazorpayOrder;
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const left = Buffer.from(a, 'hex');
    const right = Buffer.from(b, 'hex');
    return left.length > 0 && left.length === right.length && crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

/** Verifies the Checkout success response: HMAC-SHA256(order_id|payment_id, key_secret). */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayKeys();
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest('hex');
  return safeEqualHex(expected, params.signature);
}

/** Verifies a webhook: HMAC-SHA256(raw body, webhook secret) against X-Razorpay-Signature. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new RazorpayConfigError('RAZORPAY_WEBHOOK_SECRET is not set');
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqualHex(expected, signature);
}

export interface PayerDetails {
  payer_name?: string;
  payer_email?: string;
  payer_contact?: string;
  payment_method_label?: string;
}

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

/**
 * Best-effort details of whoever paid, from Razorpay's payment record: the email and phone they
 * entered in Checkout, the cardholder name (card payments only, UPI/netbanking/wallets carry no
 * name) and how they paid. Never throws.
 */
export async function fetchPayerDetails(paymentId: string): Promise<PayerDetails | null> {
  try {
    const { keyId, keySecret } = getRazorpayKeys();
    const res = await fetch(`${RAZORPAY_API}/payments/${encodeURIComponent(paymentId)}?expand[]=card`, {
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const p = await res.json();

    let method: string | undefined;
    switch (p?.method) {
      case 'card': {
        const network = str(p.card?.network);
        const last4 = str(p.card?.last4);
        method = `${network ? `${network} ` : ''}${p.card?.type ? `${p.card.type} ` : ''}card${last4 ? ` ending ${last4}` : ''}`;
        break;
      }
      case 'upi':
        method = `UPI${str(p.vpa) ? ` (${p.vpa})` : ''}`;
        break;
      case 'netbanking':
        method = `Netbanking${str(p.bank) ? ` (${p.bank})` : ''}`;
        break;
      case 'wallet':
        method = `Wallet${str(p.wallet) ? ` (${p.wallet})` : ''}`;
        break;
      default:
        method = str(p?.method);
    }

    return {
      payer_name: str(p?.card?.name),
      payer_email: str(p?.email),
      payer_contact: str(p?.contact),
      payment_method_label: method ? method.charAt(0).toUpperCase() + method.slice(1) : undefined,
    };
  } catch (err) {
    console.warn('[Razorpay] Could not fetch payer details:', (err as Error).message);
    return null;
  }
}
