import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { consolidateStatements } from '@/lib/ocr-api';
import { getDocumentsByIds } from '@/lib/models/Document';
import { ConsolidateRequest } from '@/types/ocr';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const { searchParams } = new URL(req.url);
    const asExcel = searchParams.get('as_excel') === 'true';

    const body: ConsolidateRequest = await req.json();

    if (!body.request_ids || body.request_ids.length === 0) {
      return NextResponse.json({ error: 'Please provide statement request_ids to consolidate' }, { status: 400 });
    }

    // IDOR Protection: Verify all requested document IDs belong to the current session / guest scope
    const allowedDocs = await getDocumentsByIds(body.request_ids, userEmail || undefined);
    const allowedIdSet = new Set(allowedDocs.map((d) => d.id));
    const unauthorizedIds = body.request_ids.filter((id) => !allowedIdSet.has(id));

    if (unauthorizedIds.length > 0) {
      return NextResponse.json(
        {
          error: 'Access denied: One or more requested documents do not belong to your account or could not be found.',
          unauthorized_ids: unauthorizedIds,
        },
        { status: 403 }
      );
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

