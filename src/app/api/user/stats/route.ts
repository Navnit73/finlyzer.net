import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserStats } from '@/lib/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const statsData = await getUserStats(session.user.email);

    return NextResponse.json({
      stats: statsData.stats,
      user: {
        email: session.user.email,
        name: session.user.name || statsData.user.name || null,
        image: session.user.image || statsData.user.image || null,
        tier: statsData.user.tier || 'free',
        pages_processed: statsData.user.pages_processed || 0,
        free_pages_limit: statsData.user.free_pages_limit || 10,
        purchased_pages: statsData.user.purchased_pages || 0,
      },
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Failed to fetch user stats' }, { status: 500 });
  }
}
