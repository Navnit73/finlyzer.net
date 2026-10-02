import { NextRequest, NextResponse } from 'next/server';
import { downloadExportFile, generateExportDirect, generateFallbackExportBlob } from '@/lib/ocr-api';
import { getDocumentById } from '@/lib/models/Document';
import { ExportFormat } from '@/types/ocr';

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

    let blob: Blob;

    try {
      // 1. First attempt direct binary stream from OCR API backend
      blob = await downloadExportFile(id, format);
    } catch {
      // 2. If download by ID failed, check MongoDB stored extraction JSON
      const storedDoc = await getDocumentById(id);
      if (storedDoc && storedDoc.extraction) {
        blob = await generateExportDirect(format, storedDoc.extraction);
      } else {
        blob = generateFallbackExportBlob(format, id);
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
