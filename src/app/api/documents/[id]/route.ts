import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDocumentById, deleteDocumentById } from '@/lib/models/Document';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const doc = await getDocumentById(id, userEmail || undefined);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Strip internal _id if present
    const { _id, ...safeDoc } = doc as unknown as { _id?: unknown };
    return NextResponse.json(safeDoc);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Failed to fetch document' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const doc = await getDocumentById(id, userEmail || undefined);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Allow deleting if user owns it, or if it's a guest document
    if (doc.user_email !== 'guest' && (!userEmail || doc.user_email !== userEmail.toLowerCase().trim())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deleted = await deleteDocumentById(id, userEmail || undefined);
    if (!deleted) {
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Document deleted successfully' });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Failed to delete document' }, { status: 500 });
  }
}
