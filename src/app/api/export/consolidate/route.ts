import { NextRequest, NextResponse } from 'next/server';
import { consolidateStatements } from '@/lib/ocr-api';
import { ConsolidateRequest } from '@/types/ocr';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const asExcel = searchParams.get('as_excel') === 'true';

    const body: ConsolidateRequest = await req.json();

    if (!body.request_ids || body.request_ids.length === 0) {
      return NextResponse.json({ error: 'Please provide statement request_ids to consolidate' }, { status: 400 });
    }

    const result = await consolidateStatements(body, asExcel);

    if (asExcel && result instanceof Blob) {
      const buffer = Buffer.from(await result.arrayBuffer());
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="Annual_Master_PL_Report.xlsx"',
        },
      });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Consolidation failed' }, { status: 500 });
  }
}
