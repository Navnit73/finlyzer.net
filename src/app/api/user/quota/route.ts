import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserQuota } from '@/lib/models/User';
import { errorResponse, successResponse } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    const quota = await getUserQuota(userEmail);

    return successResponse(
      {
        ...quota,
        userEmail: session?.user?.email || null,
        userName: session?.user?.name || null,
        userImage: session?.user?.image || null,
      },
      200,
      { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' }
    );
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to fetch quota', 500);
  }
}
