import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDocumentById, deleteDocumentById } from '@/lib/models/Document';
import { errorResponse, successResponse } from '@/lib/api-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return errorResponse('Valid Document ID is required', 400, 'BAD_REQUEST');
    }

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const doc = await getDocumentById(id.trim(), userEmail || undefined);
    if (!doc) {
      return errorResponse('Document not found or access denied', 404, 'NOT_FOUND');
    }

    // Strip internal _id if present
    const { _id, ...safeDoc } = doc as unknown as { _id?: unknown };
    return successResponse(safeDoc);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to fetch document', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || typeof id !== 'string' || !id.trim()) {
      return errorResponse('Valid Document ID is required', 400, 'BAD_REQUEST');
    }

    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const doc = await getDocumentById(id.trim(), userEmail || undefined);
    if (!doc) {
      return errorResponse('Document not found or access denied', 404, 'NOT_FOUND');
    }

    // Allow deleting if user owns it, or if it's a guest document
    if (doc.user_email !== 'guest' && (!userEmail || doc.user_email !== userEmail.toLowerCase().trim())) {
      return errorResponse('Unauthorized to delete this document', 403, 'FORBIDDEN');
    }

    const deleted = await deleteDocumentById(id.trim(), userEmail || undefined);
    if (!deleted) {
      return errorResponse('Delete operation failed', 500);
    }

    return successResponse({ success: true, message: 'Document deleted successfully' });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to delete document', 500);
  }
}
