import fs from 'fs';
import path from 'path';
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib';
import { OrderRecord } from '@/types/pricing';
import { SITE_URL } from '@/lib/seo-config';

// pdf-lib can't use CSS variables, so these mirror the tokens in globals.css.
const BRAND = rgb(0.439, 0.941, 0); // --color-brand #70F000
const INK = rgb(0.09, 0.09, 0.09); // --color-ink #171717
const MUTED = rgb(0.467, 0.467, 0.467); // --color-text-secondary #777777
const SUBTLE = rgb(0.961, 0.961, 0.961); // --color-surface-subtle #F5F5F5
const BORDER = rgb(0.898, 0.898, 0.898); // --color-border #E5E5E5
const BRAND_SOFT = rgb(0.914, 1, 0.839); // --color-brand-soft #E9FFD6
const WHITE = rgb(1, 1, 1);

const BUSINESS = {
  name: 'Finlyzers',
  domain: SITE_URL.replace(/^https?:\/\//, ''),
  operator: 'Navnit Rai',
  email: 'navnitrai5389@gmail.com',
  phone: '+91 7355087072',
};

/** Standard PDF fonts only cover WinAnsi, so non-USD currencies print as a code (INR 830.00), never a symbol like the rupee sign. */
function formatMoney(amountMinor: number, currency: string): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: currency === 'USD' ? 'symbol' : 'code',
  }).format(amountMinor / 100);
  return formatted.replace(/ /g, ' ');
}

/** Standard PDF fonts throw on characters outside WinAnsi (e.g. non-Latin names), so swap those for '?'. */
function toWinAnsi(value: string, font: PDFFont): string {
  const supported = new Set(font.getCharacterSet());
  return Array.from(value, (ch) => (supported.has(ch.codePointAt(0)!) ? ch : '?')).join('');
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generateInvoicePdf(order: OrderRecord, userName?: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(`Payment receipt ${order.order_id}`);
  pdfDoc.setAuthor(BUSINESS.name);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  const contentWidth = width - margin * 2;
  const right = width - margin;

  const text = (
    value: string,
    x: number,
    y: number,
    opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; align?: 'left' | 'right' } = {}
  ) => {
    const font = opts.font ?? regular;
    const size = opts.size ?? 10;
    value = toWinAnsi(value, font);
    const w = font.widthOfTextAtSize(value, size);
    page.drawText(value, { x: opts.align === 'right' ? x - w : x, y, size, font, color: opts.color ?? INK });
  };

  const currency = order.currency || 'USD';
  const amountMinor = order.amount_minor ?? Math.round(order.amount_usd * 100);
  const total = formatMoney(amountMinor, currency);
  const paidAt = new Date(order.updated_at || order.created_at);
  const dateLabel = paidAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

  // ---- Header: logo + brand on the left, document title on the right
  let y = height - margin;
  let textX = margin;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logo = await pdfDoc.embedPng(fs.readFileSync(logoPath));
      page.drawImage(logo, { x: margin, y: y - 34, width: 38, height: 38 });
      textX = margin + 48;
    }
  } catch {
    textX = margin;
  }
  text(BUSINESS.name, textX, y - 14, { size: 22, font: bold });
  text(BUSINESS.domain, textX, y - 30, { size: 9, color: MUTED });

  text('PAYMENT RECEIPT', right, y - 12, { size: 18, font: bold, align: 'right' });
  text(`No. ${order.order_id}`, right, y - 28, { size: 8, color: MUTED, align: 'right' });

  y -= 52;
  page.drawRectangle({ x: margin, y, width: contentWidth, height: 3, color: BRAND });

  // ---- Paid banner with total
  y -= 28;
  const bannerH = 64;
  page.drawRectangle({ x: margin, y: y - bannerH, width: contentWidth, height: bannerH, color: BRAND_SOFT });
  page.drawRectangle({ x: margin, y: y - bannerH, width: 4, height: bannerH, color: BRAND });
  text('PAID', margin + 20, y - 24, { size: 9, font: bold });
  text(`Paid on ${dateLabel}`, margin + 20, y - 42, { size: 10, color: MUTED });
  text(total, right - 20, y - 48, { size: 26, font: bold, align: 'right' });
  text('Total paid', right - 20, y - 16, { size: 9, color: MUTED, align: 'right' });

  // ---- Billed to / Payment details
  y -= bannerH + 28;
  const colGap = 24;
  const colW = (contentWidth - colGap) / 2;
  const col2X = margin + colW + colGap;

  const label = (s: string, x: number, yy: number) => text(s, x, yy, { size: 8, font: bold, color: MUTED });
  label('BILLED TO', margin, y);
  let ly = y - 16;
  const billedName = order.payer_name || userName;
  if (billedName) {
    text(billedName, margin, ly, { size: 11, font: bold });
    ly -= 15;
  }
  text(order.user_email, margin, ly, { size: 10 });
  // Email and phone the customer entered at Razorpay Checkout, when they differ from the account email.
  if (order.payer_email && order.payer_email.toLowerCase() !== order.user_email.toLowerCase()) {
    ly -= 14;
    text(order.payer_email, margin, ly, { size: 9, color: MUTED });
  }
  if (order.payer_contact) {
    ly -= 14;
    text(order.payer_contact, margin, ly, { size: 9, color: MUTED });
  }

  label('PAYMENT DETAILS', col2X, y);
  let ry = y - 16;
  const detail = (k: string, v: string) => {
    text(k, col2X, ry, { size: 9, color: MUTED });
    text(v, right, ry, { size: 9, font: bold, align: 'right' });
    ry -= 14;
  };
  detail('Method', order.payment_method_label || 'Razorpay secure checkout');
  if (order.razorpay_payment_id) detail('Payment ID', order.razorpay_payment_id);
  if (order.razorpay_order_id) detail('Gateway order', order.razorpay_order_id);
  detail('Currency', currency);

  y = Math.min(ly, ry) - 24;

  // ---- Line items
  const headerH = 28;
  page.drawRectangle({ x: margin, y: y - headerH, width: contentWidth, height: headerH, color: INK });
  const cols = { pages: margin + contentWidth * 0.6, amount: right - 14 };
  text('DESCRIPTION', margin + 14, y - 18, { size: 8, font: bold, color: WHITE });
  text('PAGE CREDITS', cols.pages, y - 18, { size: 8, font: bold, color: WHITE });
  text('AMOUNT', cols.amount, y - 18, { size: 8, font: bold, color: WHITE, align: 'right' });
  y -= headerH;

  const rowH = 54;
  page.drawRectangle({ x: margin, y: y - rowH, width: contentWidth, height: rowH, color: WHITE, borderColor: BORDER, borderWidth: 1 });
  text(`${order.plan_name} credit package`, margin + 14, y - 24, { size: 11, font: bold });
  text('AI financial statement extraction pages', margin + 14, y - 40, { size: 8.5, color: MUTED });
  text(`+${order.pages_credited.toLocaleString('en-US')} pages`, cols.pages, y - 30, { size: 10, font: bold });
  text(total, cols.amount, y - 30, { size: 11, font: bold, align: 'right' });
  y -= rowH + 20;

  // ---- Totals
  const totalsW = 240;
  const tx = right - totalsW;
  const totalsRow = (k: string, v: string, yy: number) => {
    text(k, tx, yy, { size: 10, color: MUTED });
    text(v, right, yy, { size: 10, align: 'right' });
  };
  totalsRow('Subtotal', total, y);
  totalsRow('Tax', 'Not applicable', y - 18);
  page.drawLine({ start: { x: tx, y: y - 30 }, end: { x: right, y: y - 30 }, thickness: 1, color: BORDER });
  text('Total paid', tx, y - 50, { size: 12, font: bold });
  text(total, right, y - 50, { size: 14, font: bold, align: 'right' });
  y -= 84;

  // ---- Credit confirmation (wrapped so long emails never overflow)
  const note = `${order.pages_credited.toLocaleString('en-US')} page credits were added to ${order.user_email}. Purchased credits never expire and can be used on any statement.`;
  const noteLines = wrapText(toWinAnsi(note, regular), regular, 9, contentWidth - 32);
  const noteH = 34 + noteLines.length * 13;
  page.drawRectangle({ x: margin, y: y - noteH, width: contentWidth, height: noteH, color: SUBTLE, borderColor: BORDER, borderWidth: 1 });
  text('CREDITS ACTIVATED', margin + 16, y - 20, { size: 8, font: bold });
  noteLines.forEach((line, i) => text(line, margin + 16, y - 36 - i * 13, { size: 9, color: MUTED }));

  // ---- Footer
  drawFooter(page, { margin, right, text });
  return await pdfDoc.save();
}

function drawFooter(
  page: PDFPage,
  ctx: {
    margin: number;
    right: number;
    text: (v: string, x: number, y: number, o?: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; align?: 'left' | 'right' }) => void;
  }
) {
  const { margin, right, text } = ctx;
  page.drawLine({ start: { x: margin, y: 84 }, end: { x: right, y: 84 }, thickness: 1, color: BORDER });
  text('Questions about this receipt or need a refund?', margin, 66, { size: 9, color: MUTED });
  text(`${BUSINESS.operator} (${BUSINESS.name})  |  ${BUSINESS.email}  |  ${BUSINESS.phone}`, margin, 52, { size: 9 });
  text(`${BUSINESS.name} is operated by ${BUSINESS.operator}. This is a computer-generated receipt and needs no signature.`, margin, 34, { size: 8, color: MUTED });
}
