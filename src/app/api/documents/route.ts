import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserDocuments, getDocumentsByIds } from '@/lib/models/Document';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get('ids');

    // If request supplies IDs (e.g. from guest local browser history), return matching documents from DB
    if (idsParam) {
      const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
      const docs = await getDocumentsByIds(ids);
      return NextResponse.json({
        total: docs.length,
        page: 1,
        page_size: docs.length,
        total_pages: 1,
        items: docs,
      });
    }

    // If guest without specific IDs, return empty set gracefully without 401 error
    if (!userEmail) {
      return NextResponse.json(
        {
          total: 0,
          page: 1,
          page_size: 20,
          total_pages: 0,
          items: [],
          isGuest: true,
        },
        { status: 200 }
      );
    }

    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('page_size') || '20', 10);
    const documentType = searchParams.get('document_type') || 'all';
    const search = searchParams.get('search') || '';

    const history = await getUserDocuments(userEmail, page, pageSize, documentType, search);
    return NextResponse.json(history);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Failed to fetch history' }, { status: 500 });
  }
}
