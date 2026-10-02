import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { OCRWebhookPayload, ExtractionResponse } from '@/types/ocr';
import { saveDocumentExtraction } from '@/lib/models/Document';
import { incrementUserPageCount } from '@/lib/models/User';
import { fetchDocumentById } from '@/lib/ocr-api';

const WEBHOOK_SECRET = process.env.OCR_WEBHOOK_SECRET || 'ocr_webhook_secret_2026';

/**
 * POST /api/ocr/webhook
 * Receives HMAC-SHA256 signed event webhooks from the AI OCR background worker service.
 * Supports: ocr.job.started, ocr.job.progress, ocr.job.completed, ocr.job.failed
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signatureHeader = req.headers.get('x-webhook-signature') || req.headers.get('X-Webhook-Signature');

    // 1. Signature Verification with HMAC-SHA256
    if (!signatureHeader) {
      console.warn('⚠️ [OCR Webhook] Missing x-webhook-signature header');
      return NextResponse.json({ error: 'Missing x-webhook-signature header' }, { status: 401 });
    }

    const cleanSignature = signatureHeader.startsWith('sha256=')
      ? signatureHeader.slice(7)
      : signatureHeader;

    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    let isValid = false;
    try {
      const sigBuffer = Buffer.from(cleanSignature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');
      if (sigBuffer.length === expectedBuffer.length) {
        isValid = crypto.timingSafeEqual(sigBuffer, expectedBuffer);
      }
    } catch {
      isValid = false;
    }

    if (!isValid) {
      console.error('❌ [OCR Webhook] Invalid HMAC signature provided:', signatureHeader);
      return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 403 });
    }

    // 2. Parse Event Payload
    const payload: OCRWebhookPayload = JSON.parse(rawBody);
    const { event, job_id, document_id, metadata, result } = payload;

    console.log(`🔔 [OCR Webhook] Received ${event} for job ${job_id} (Document: ${document_id || 'N/A'})`);

    // 3. Process Events
    if (event === 'ocr.job.completed') {
      const effectiveDocId = document_id || result?.id || job_id;
      const userEmail = (metadata?.user_email as string) || 'guest';
      const filename = (metadata?.filename as string) || result?.filename || 'statement.pdf';
      const pages = metadata?.total_pages || result?.metadata?.pages || 1;

      let extractionData: ExtractionResponse | null = result || null;

      // If extraction is not directly embedded, fetch it from backend
      if (!extractionData && effectiveDocId) {
        try {
          extractionData = await fetchDocumentById(effectiveDocId);
        } catch (fetchErr) {
          console.warn(`[OCR Webhook] Could not fetch document ${effectiveDocId}:`, (fetchErr as Error).message);
        }
      }

      if (extractionData) {
        try {
          await saveDocumentExtraction(userEmail, extractionData, filename);
          if (userEmail && userEmail !== 'guest') {
            await incrementUserPageCount(userEmail, pages);
          }
          console.log(`💾 [OCR Webhook] Document ${effectiveDocId} saved for user ${userEmail} (${pages} pages)`);
        } catch (dbErr) {
          console.error('[OCR Webhook] Failed to save extraction to database:', (dbErr as Error).message);
        }
      }
    } else if (event === 'ocr.job.failed') {
      console.warn(`⚠️ [OCR Webhook] Job ${job_id} reported failure:`, payload.error || 'Unknown error');
    }

    return NextResponse.json({
      received: true,
      event,
      job_id,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error('❌ [OCR Webhook] Handler error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Internal webhook processing error' },
      { status: 500 }
    );
  }
}
