import { SITE_URL } from '@/lib/seo-config';

const RESEND_API = 'https://api.resend.com/emails';

// Email clients can't use the CSS variables from globals.css, so these mirror the design tokens:
// --color-brand, --color-on-brand, --color-ink, --color-text-secondary, --color-surface-subtle, --color-border.
const C = {
  brand: '#70F000',
  onBrand: '#141414',
  ink: '#171717',
  secondary: '#777777',
  subtle: '#F5F5F5',
  border: '#E5E5E5',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Resend dedupes sends sharing a key for 24h, so webhook retries can't double-send. */
  idempotencyKey?: string;
}

/**
 * Sends a transactional email through Resend. Never throws: email is a courtesy and must not
 * fail a payment or a document run. Returns whether Resend accepted the message.
 */
export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn('[Email] RESEND_API_KEY / EMAIL_FROM not set, skipping email:', params.subject);
    return false;
  }

  try {
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...(params.idempotencyKey ? { 'Idempotency-Key': params.idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}),
      }),
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error('[Email] Resend rejected message:', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] Send failed:', (err as Error).message);
    return false;
  }
}

function layout(title: string, bodyHtml: string, cta?: { label: string; href: string }): string {
  return `<!doctype html><html><body style="margin:0;padding:24px;background:${C.subtle};font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:${C.ink}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border:1px solid ${C.border};border-radius:12px">
<tr><td style="padding:28px 32px">
<p style="margin:0 0 20px;font-size:18px;font-weight:800">Finlyzers</p>
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">${escapeHtml(title)}</h1>
${bodyHtml}
${cta ? `<p style="margin:24px 0 0"><a href="${cta.href}" style="display:inline-block;padding:12px 24px;background:${C.brand};color:${C.onBrand};font-weight:700;text-decoration:none;border-radius:999px">${escapeHtml(cta.label)}</a></p>` : ''}
</td></tr>
<tr><td style="padding:16px 32px;border-top:1px solid ${C.border};font-size:12px;color:${C.secondary}">You received this because of activity on your Finlyzers account. Questions? Reply to this email.</td></tr>
</table></td></tr></table></body></html>`;
}

function rows(items: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.subtle};border-radius:8px;margin:16px 0">${items
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 16px;font-size:14px;color:${C.secondary}">${escapeHtml(k)}</td><td align="right" style="padding:10px 16px;font-size:14px;font-weight:700">${escapeHtml(v)}</td></tr>`
    )
    .join('')}</table>`;
}

export function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amountMinor / 100);
}

export async function sendCreditPurchaseEmail(params: {
  to: string;
  name?: string | null;
  orderId: string;
  planName: string;
  pagesAdded: number;
  amountMinor: number;
  currency: string;
  paymentId: string;
  totalCredits: number;
}): Promise<boolean> {
  const amount = formatMoney(params.amountMinor, params.currency);
  const details: [string, string][] = [
    ['Package', params.planName],
    ['Pages added', `+${params.pagesAdded.toLocaleString('en-US')}`],
    ['Amount paid', amount],
    ['Order', params.orderId],
    ['Payment ID', params.paymentId],
    ['Credits available now', `${params.totalCredits.toLocaleString('en-US')} pages`],
  ];
  const greeting = params.name ? `Hi ${escapeHtml(params.name)},` : 'Hi,';
  const html = layout(
    'Payment received, credits added',
    `<p style="margin:0 0 8px;font-size:15px;line-height:1.6">${greeting}</p><p style="margin:0;font-size:15px;line-height:1.6">Thanks for your purchase. <strong>${params.pagesAdded.toLocaleString('en-US')} pages</strong> have been added to your account and never expire.</p>${rows(details)}`,
    { label: 'Open workspace', href: `${SITE_URL}/workspace` }
  );
  const text = `Payment received, credits added\n\n${details.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nOpen your workspace: ${SITE_URL}/workspace`;
  return sendEmail({
    to: params.to,
    subject: `Payment received: ${params.pagesAdded.toLocaleString('en-US')} pages added`,
    html,
    text,
    idempotencyKey: `purchase-${params.orderId}`,
  });
}

export async function sendLowCreditEmail(params: {
  to: string;
  name?: string | null;
  remaining: number;
  state: 'low' | 'empty';
  alertKey: string;
}): Promise<boolean> {
  const empty = params.state === 'empty';
  const title = empty ? 'You have used all your page credits' : 'Your page credits are running low';
  const message = empty
    ? 'Your page credits are used up, so new statements can no longer be converted until you top up.'
    : `You have <strong>${params.remaining.toLocaleString('en-US')} pages</strong> left. Top up now to avoid interruptions.`;
  const html = layout(
    title,
    `<p style="margin:0 0 8px;font-size:15px;line-height:1.6">${params.name ? `Hi ${escapeHtml(params.name)},` : 'Hi,'}</p><p style="margin:0;font-size:15px;line-height:1.6">${message}</p>`,
    { label: 'Buy more credits', href: `${SITE_URL}/pricing` }
  );
  const text = `${title}\n\n${empty ? 'Your page credits are used up.' : `You have ${params.remaining} pages left.`}\nBuy more credits: ${SITE_URL}/pricing`;
  return sendEmail({ to: params.to, subject: title, html, text, idempotencyKey: params.alertKey });
}
