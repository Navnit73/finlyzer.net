import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserQuota } from '@/lib/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    const quota = await getUserQuota(userEmail);

    return NextResponse.json({
      ...quota,
      userEmail: session?.user?.email || null,
      userName: session?.user?.name || null,
      userImage: session?.user?.image || null,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || 'Failed to fetch quota' }, { status: 500 });
  }
}
