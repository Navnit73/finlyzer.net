import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAccess, errorResponse } from '@/lib/api-utils';
import { fetchAdminStats } from '@/lib/ocr-api';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stats
 * Get real-time system metrics, worker health, and job statistics (Admin Protected)
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await validateAdminAccess(req);
    if (!auth.authorized) {
      return errorResponse(auth.reason || 'Unauthorized access to admin metrics', 403, 'FORBIDDEN');
    }

    const stats = await fetchAdminStats();
    return NextResponse.json(stats);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Failed to fetch admin system statistics', 500);
  }
}
