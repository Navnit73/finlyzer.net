import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserDocuments, getDocumentsByIds } from '@/lib/models/Document';
import { errorResponse, successResponse } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids');

    // If request supplies IDs (e.g. from guest local browser history), return matching documents from DB
    if (idsParam) {
      const ids = idsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 100);

      const docs = await getDocumentsByIds(ids, userEmail || undefined);
      return successResponse({
        total: docs.length,
        page: 1,
        page_size: docs.length,
        total_pages: 1,
        items: docs,
      });
    }

    // If guest without specific IDs, return empty set gracefully without 401 error
    if (!userEmail) {
      return successResponse(
        {
          total: 0,
          page: 1,
          page_size: 20,
          total_pages: 0,
          items: [],
          isGuest: true,
        },
        200
      );
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('page_size') || '20', 10) || 20));
    const documentType = (searchParams.get('document_type') || 'all').trim();
    const search = (searchParams.get('search') || '').trim().slice(0, 100);

    const history = await getUserDocuments(userEmail, page, pageSize, documentType, search);
    return successResponse(history);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to fetch history', 500);
  }
}
