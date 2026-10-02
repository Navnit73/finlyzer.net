import { NextRequest, NextResponse } from 'next/server';
import { downloadExportFile, generateExportDirect } from '@/lib/ocr-api';
import { getDocumentById } from '@/lib/models/Document';
import { ExportFormat } from '@/types/ocr';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get('format') as ExportFormat) || 'xlsx';

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    // Check document ownership first
    const storedDoc = await getDocumentById(id, userEmail || undefined);
    if (!storedDoc) {
      return NextResponse.json(
        { error: 'Document extraction not found or access denied.' },
        { status: 404 }
      );
    }

    let blob: Blob;

    try {
      // 1. First attempt direct binary stream from OCR API backend memory cache
      blob = await downloadExportFile(id, format);
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
        return NextResponse.json(
          { error: 'Document extraction not found. Please re-upload the document to generate exports.' },
          { status: 404 }
        );
      }
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const contentType = CONTENT_TYPES[format] || 'application/octet-stream';
    const filename = `finlyzer_export_${id}.${format}`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Export download failed' }, { status: 500 });
  }
}
