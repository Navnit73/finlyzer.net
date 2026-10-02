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
      ...statsData,
      user: {
        ...statsData.user,
        name: session.user.name || statsData.user.name,
        image: session.user.image || statsData.user.image,
      },
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Failed to fetch user stats' }, { status: 500 });
  }
}
