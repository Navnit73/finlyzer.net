import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { OrderRecord } from '@/types/pricing';

export async function generateInvoicePdf(order: OrderRecord, userName?: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  
  // A4 dimensions in points: 595.28 x 841.89
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  // Embed standard Helvetica fonts
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Palette definition
  const brandGreen = rgb(0.439, 0.941, 0.0); // #70F000
  const inkDark = rgb(0.09, 0.09, 0.09); // #171717
  const surfaceSubtle = rgb(0.96, 0.96, 0.96); // #F5F5F5
  const borderGray = rgb(0.88, 0.88, 0.88); // #E0E0E0
  const textMuted = rgb(0.45, 0.45, 0.45);
  const textSuccess = rgb(0.12, 0.65, 0.28);
  const badgeBg = rgb(0.91, 1.0, 0.84);

  const margin = 48;
  let currentY = height - margin;

  // 1. Top Decorative Brand Accent Bar
  page.drawRectangle({
    x: margin,
    y: currentY - 6,
    width: width - margin * 2,
    height: 6,
    color: brandGreen,
  });

  currentY -= 32;

  // 2. Header: Company Logo & Document Title
  page.drawText('Finlyzer', {
    x: margin,
    y: currentY,
    size: 24,
    font: boldFont,
    color: inkDark,
  });

  page.drawText('.net', {
    x: margin + 92,
    y: currentY,
    size: 24,
    font: regularFont,
    color: textMuted,
  });

  // Top Right: "PAYMENT RECEIPT"
  const titleText = 'PAYMENT RECEIPT';
  const titleWidth = boldFont.widthOfTextAtSize(titleText, 16);
  page.drawText(titleText, {
    x: width - margin - titleWidth,
    y: currentY + 4,
    size: 16,
    font: boldFont,
    color: inkDark,
  });

  const subtitleText = 'Official Electronic Invoice';
  const subtitleWidth = regularFont.widthOfTextAtSize(subtitleText, 9);
  page.drawText(subtitleText, {
    x: width - margin - subtitleWidth,
    y: currentY - 10,
    size: 9,
    font: regularFont,
    color: textMuted,
  });

  currentY -= 36;

  // 3. Paid Status Pill Badge
  page.drawRectangle({
    x: margin,
    y: currentY - 18,
    width: 140,
    height: 24,
    color: badgeBg,
    borderColor: textSuccess,
    borderWidth: 1,
  });

  page.drawText('STATUS: PAID IN FULL', {
    x: margin + 12,
    y: currentY - 10,
    size: 9,
    font: boldFont,
    color: textSuccess,
  });

  currentY -= 40;

  // 4. Metadata Box (Order Info & Customer Info)
  page.drawRectangle({
    x: margin,
    y: currentY - 80,
    width: width - margin * 2,
    height: 80,
    color: surfaceSubtle,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Left Column: Order Information
  const col1X = margin + 16;
  const col2X = margin + (width - margin * 2) / 2 + 16;
  let metaY = currentY - 20;

  page.drawText('INVOICE REFERENCE:', { x: col1X, y: metaY, size: 8, font: boldFont, color: textMuted });
  page.drawText(order.order_id, { x: col1X, y: metaY - 12, size: 10, font: boldFont, color: inkDark });

  page.drawText('DATE & TIME:', { x: col1X, y: metaY - 30, size: 8, font: boldFont, color: textMuted });
  const orderDate = order.created_at ? new Date(order.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleDateString();
  page.drawText(orderDate, { x: col1X, y: metaY - 42, size: 10, font: regularFont, color: inkDark });

  // Right Column: Customer Information
  page.drawText('BILLED TO (ACCOUNT):', { x: col2X, y: metaY, size: 8, font: boldFont, color: textMuted });
  page.drawText(order.user_email, { x: col2X, y: metaY - 12, size: 10, font: boldFont, color: inkDark });

  if (userName) {
    page.drawText(userName, { x: col2X, y: metaY - 24, size: 9, font: regularFont, color: textMuted });
  }

  page.drawText('PAYMENT METHOD:', { x: col2X, y: metaY - 36, size: 8, font: boldFont, color: textMuted });
  const paymentMethod = order.razorpay_payment_id ? `Card / Gateway (${order.razorpay_payment_id})` : 'Online Secure Checkout (USD)';
  page.drawText(paymentMethod, { x: col2X, y: metaY - 48, size: 9, font: regularFont, color: inkDark });

  currentY -= 110;

  // 5. Line Item Table Header
  const tableWidth = width - margin * 2;
  page.drawRectangle({
    x: margin,
    y: currentY - 24,
    width: tableWidth,
    height: 24,
    color: inkDark,
  });

  page.drawText('DESCRIPTION', { x: margin + 12, y: currentY - 16, size: 9, font: boldFont, color: rgb(1, 1, 1) });
  page.drawText('PAGE CREDITS', { x: margin + 260, y: currentY - 16, size: 9, font: boldFont, color: rgb(1, 1, 1) });
  page.drawText('PRICE (USD)', { x: width - margin - 80, y: currentY - 16, size: 9, font: boldFont, color: rgb(1, 1, 1) });

  currentY -= 24;

  // 6. Line Item Table Row
  page.drawRectangle({
    x: margin,
    y: currentY - 44,
    width: tableWidth,
    height: 44,
    color: rgb(1, 1, 1),
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText(`${order.plan_name} Package`, {
    x: margin + 12,
    y: currentY - 18,
    size: 11,
    font: boldFont,
    color: inkDark,
  });

  page.drawText('High-Accuracy AI Financial Statement Extraction Pass', {
    x: margin + 12,
    y: currentY - 32,
    size: 8,
    font: regularFont,
    color: textMuted,
  });

  page.drawText(`+${order.pages_credited.toLocaleString()} Pages`, {
    x: margin + 260,
    y: currentY - 24,
    size: 10,
    font: boldFont,
    color: textSuccess,
  });

  page.drawText(`$${order.amount_usd.toFixed(2)}`, {
    x: width - margin - 80,
    y: currentY - 24,
    size: 11,
    font: boldFont,
    color: inkDark,
  });

  currentY -= 64;

  // 7. Summary Breakdown Box
  const summaryBoxWidth = 240;
  const summaryBoxX = width - margin - summaryBoxWidth;

  page.drawRectangle({
    x: summaryBoxX,
    y: currentY - 80,
    width: summaryBoxWidth,
    height: 80,
    color: surfaceSubtle,
    borderColor: borderGray,
    borderWidth: 1,
  });

  let sumY = currentY - 20;

  // Subtotal
  page.drawText('Subtotal:', { x: summaryBoxX + 16, y: sumY, size: 9, font: regularFont, color: textMuted });
  page.drawText(`$${order.amount_usd.toFixed(2)} USD`, { x: summaryBoxX + summaryBoxWidth - 95, y: sumY, size: 9, font: regularFont, color: inkDark });

  // Tax / VAT
  sumY -= 18;
  page.drawText('Taxes & Fees (0%):', { x: summaryBoxX + 16, y: sumY, size: 9, font: regularFont, color: textMuted });
  page.drawText('$0.00 USD', { x: summaryBoxX + summaryBoxWidth - 95, y: sumY, size: 9, font: regularFont, color: inkDark });

  // Total Paid
  sumY -= 24;
  page.drawLine({
    start: { x: summaryBoxX + 16, y: sumY + 14 },
    end: { x: summaryBoxX + summaryBoxWidth - 16, y: sumY + 14 },
    thickness: 1,
    color: borderGray,
  });

  page.drawText('TOTAL PAID:', { x: summaryBoxX + 16, y: sumY, size: 10, font: boldFont, color: inkDark });
  page.drawText(`$${order.amount_usd.toFixed(2)} USD`, { x: summaryBoxX + summaryBoxWidth - 95, y: sumY, size: 11, font: boldFont, color: textSuccess });

  currentY -= 110;

  // 8. Account Credit Confirmation Banner
  page.drawRectangle({
    x: margin,
    y: currentY - 48,
    width: tableWidth,
    height: 48,
    color: surfaceSubtle,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText('PAGE CREDITS ACTIVATION GUARANTEE', {
    x: margin + 14,
    y: currentY - 18,
    size: 8,
    font: boldFont,
    color: inkDark,
  });

  page.drawText(
    `Your account ${order.user_email} has been credited with ${order.pages_credited.toLocaleString()} pages. These credits never expire and are ready for instant extraction.`,
    {
      x: margin + 14,
      y: currentY - 32,
      size: 8,
      font: regularFont,
      color: textMuted,
    }
  );

  currentY -= 70;

  // 9. Terms and Support Information
  page.drawText('CUSTOMER SUPPORT & BILLING INQUIRIES', {
    x: margin,
    y: currentY,
    size: 8,
    font: boldFont,
    color: inkDark,
  });

  currentY -= 14;
  page.drawText('If you have any questions concerning this invoice or need custom enterprise contracts, contact us at:', {
    x: margin,
    y: currentY,
    size: 8,
    font: regularFont,
    color: textMuted,
  });

  currentY -= 12;
  page.drawText('Website: https://finlyzer.net  |  Email: billing@finlyzer.net  |  Security: 256-Bit SSL Encrypted', {
    x: margin,
    y: currentY,
    size: 8,
    font: regularFont,
    color: textMuted,
  });

  // 10. Footer at bottom of page
  page.drawLine({
    start: { x: margin, y: 40 },
    end: { x: width - margin, y: 40 },
    thickness: 1,
    color: borderGray,
  });

  page.drawText('Finlyzer AI Financial Statement OCR Hub — Thank you for your business!', {
    x: margin,
    y: 26,
    size: 8,
    font: regularFont,
    color: textMuted,
  });

  page.drawText(`Generated on ${new Date().toISOString().substring(0, 10)}`, {
    x: width - margin - 120,
    y: 26,
    size: 8,
    font: regularFont,
    color: textMuted,
  });

  return await pdfDoc.save();
}
