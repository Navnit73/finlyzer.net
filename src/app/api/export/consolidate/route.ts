import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { consolidateStatements } from '@/lib/ocr-api';
import { getDocumentsByIds } from '@/lib/models/Document';
import { ConsolidateRequest } from '@/types/ocr';
import { errorResponse, successResponse, safeParseJson } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const { searchParams } = new URL(req.url);
    const asExcel = searchParams.get('as_excel') === 'true';

    const { data: body, error: parseError } = await safeParseJson<ConsolidateRequest>(req);
    if (parseError || !body) {
      return errorResponse(parseError || 'Invalid request body', 400, 'BAD_REQUEST');
    }

    if (!body.request_ids || !Array.isArray(body.request_ids) || body.request_ids.length === 0) {
      return errorResponse('Please provide an array of statement request_ids to consolidate', 400, 'MISSING_IDS');
    }

    const safeRequestIds = body.request_ids.slice(0, 50); // Cap consolidation to 50 statements

    // IDOR Protection: Verify all requested document IDs belong to the current session / guest scope
    const allowedDocs = await getDocumentsByIds(safeRequestIds, userEmail || undefined);
    const allowedIdSet = new Set(allowedDocs.map((d) => d.id));
    const unauthorizedIds = safeRequestIds.filter((id) => !allowedIdSet.has(id));

    if (unauthorizedIds.length > 0) {
      return errorResponse(
        'Access denied: One or more requested documents do not belong to your account or could not be found.',
        403,
        'UNAUTHORIZED_DOCUMENTS',
        { unauthorized_ids: unauthorizedIds }
      );
    }

    const result = await consolidateStatements({ ...body, request_ids: safeRequestIds }, asExcel);

    if (asExcel && result instanceof Blob) {
      const buffer = Buffer.from(await result.arrayBuffer());
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment; filename="Annual_Master_PL_Report.xlsx"',
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    return successResponse(result);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Consolidation failed', 500);
  }
}
