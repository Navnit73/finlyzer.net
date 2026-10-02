import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchAdminStats } from '@/lib/ocr-api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stats
 * Get real-time system metrics, worker health, and job statistics
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // Optional role check - allow authenticated session in dev/prod
    const stats = await fetchAdminStats();
    return NextResponse.json(stats);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin system statistics' },
      { status: 500 }
    );
  }
}
