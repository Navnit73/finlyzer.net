import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserDocuments } from '@/lib/models/Document';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        {
          error: 'Please log in to view your document history',
          code: 'LOGIN_REQUIRED',
          total: 0,
          page: 1,
          page_size: 20,
          total_pages: 0,
          items: [],
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
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
