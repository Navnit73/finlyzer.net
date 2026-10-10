export interface RazorpayCheckoutOptions {
  key: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: 'payment.failed', cb: (res: { error: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Checkout is only available in the browser'));
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CHECKOUT_SRC;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error('Could not load the payment window. Check your connection and try again.'));
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

/**
 * Opens Razorpay Checkout. Resolves with the signed response on success and null if the customer
 * closes the window. Rejects only if they close it after a failed attempt: Checkout lets the
 * customer retry inside the same window, so a failure alone must not settle the promise.
 */
export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<RazorpaySuccessResponse | null> {
  await loadCheckoutScript();
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error('Payment window failed to load. Please try again.');

  return new Promise((resolve, reject) => {
    let lastError: string | null = null;
    const rzp = new Razorpay({
      key: options.key,
      order_id: options.razorpay_order_id,
      amount: options.amount,
      currency: options.currency,
      name: options.name,
      description: options.description,
      prefill: options.prefill,
      theme: { color: '#70F000' },
      handler: (response: RazorpaySuccessResponse) => resolve(response),
      modal: {
        ondismiss: () => (lastError ? reject(new Error(lastError)) : resolve(null)),
      },
    });
    rzp.on('payment.failed', (res) => {
      lastError = res.error?.description || 'Payment failed. Please try again.';
    });
    rzp.open();
  });
}
