import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deleteUserAccount } from '@/lib/models/User';
import { deleteAllUserDocuments } from '@/lib/models/Document';
import { deleteAllUserOrders } from '@/lib/models/Order';

/**
 * DELETE /api/user/account
 * Privacy & GDPR Compliance: Permanently delete user account and wipe all associated personal data
 * (saved documents, billing records, credit stats, and profile).
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to manage account data.' }, { status: 401 });
    }

    const email = session.user.email;

    // 1. Delete all user documents & extractions
    const deletedDocsCount = await deleteAllUserDocuments(email);

    // 2. Delete all orders & transaction history
    const deletedOrdersCount = await deleteAllUserOrders(email);

    // 3. Delete user account record
    await deleteUserAccount(email);

    return NextResponse.json({
      success: true,
      message: 'Account and all associated personal data have been permanently deleted.',
      deletedDocuments: deletedDocsCount,
      deletedOrders: deletedOrdersCount,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { error: error.message || 'Failed to delete account data' },
      { status: 500 }
    );
  }
}
