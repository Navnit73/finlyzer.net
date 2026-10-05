import { NextRequest, NextResponse } from 'next/server';
import { downloadExportFile, generateExportDirect } from '@/lib/ocr-api';
import { getDocumentById } from '@/lib/models/Document';
import { ExportFormat } from '@/types/ocr';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { errorResponse } from '@/lib/api-utils';

const CONTENT_TYPES: Record<ExportFormat, string> = {
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
  csv: 'text/csv',
  ofx: 'application/x-ofx',
  qbo: 'application/vnd.intu.qbo',
  qif: 'application/x-qif',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return errorResponse('Valid Document ID is required', 400, 'BAD_REQUEST');
    }

    const { searchParams } = new URL(req.url);
    const rawFormat = (searchParams.get('format') || 'xlsx').toLowerCase().trim() as ExportFormat;
    const allowedFormats: ExportFormat[] = ['xlsx', 'pdf', 'csv', 'ofx', 'qbo', 'qif'];
    const format = allowedFormats.includes(rawFormat) ? rawFormat : 'xlsx';

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    // Check document ownership & permissions
    const storedDoc = await getDocumentById(id.trim(), userEmail || undefined);
    if (!storedDoc) {
      return errorResponse('Document extraction not found or access denied.', 404, 'NOT_FOUND');
    }

    const isGuestDoc = storedDoc.is_guest || storedDoc.user_email === 'guest';

    // If authenticated document, verify ownership
    if (!isGuestDoc && (!userEmail || storedDoc.user_email !== userEmail.toLowerCase().trim())) {
      return errorResponse('Unauthorized: You do not have permission to download this document.', 403, 'FORBIDDEN');
    }

    // Guest Flow Download Policy Enforcements:
    // 1-10 pages: Free download
    // 11-30 pages: Must be paid before downloading ($10 unlock)
    // >30 pages: Requires registered account
    if (isGuestDoc) {
      const docPages = storedDoc.pages || 1;
      if (docPages > 30) {
        return errorResponse(
          'Documents over 30 pages require a registered account to download. Please sign in with Google.',
          403,
          'LOGIN_REQUIRED'
        );
      }

      if (docPages > 10 && !storedDoc.is_paid) {
        return errorResponse(
          'Payment required to download statements with 11–30 pages ($10). Please unlock downloads to continue.',
          402,
          'PAYMENT_REQUIRED',
          {
            document_id: storedDoc.id,
            pages: docPages,
            price_usd: 10,
          }
        );
      }
    }

    let blob: Blob;

    try {
      // 1. First attempt direct binary stream from OCR API backend memory cache
      blob = await downloadExportFile(id.trim(), format);
    } catch {
      // 2. If memory cache missed, check MongoDB stored extraction JSON and generate direct export
      if (storedDoc.extraction) {
        blob = await generateExportDirect(
          format,
          storedDoc.extraction as Record<string, unknown>,
          storedDoc.id,
          storedDoc.document_type || 'bank_statement',
          storedDoc.raw_text || ''
        );
      } else {
        return errorResponse('Document extraction not found. Please re-upload the document to generate exports.', 404, 'EXTRACTION_MISSING');
      }
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const contentType = CONTENT_TYPES[format] || 'application/octet-stream';
    const filename = `finlyzers_export_${id.trim()}.${format}`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Export download failed', 500);
  }
}
