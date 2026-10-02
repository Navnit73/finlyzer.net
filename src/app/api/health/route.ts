import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { checkOcrHealth } from '@/lib/ocr-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [dbResult, ocrResult] = await Promise.allSettled([
    (async () => {
      const db = await getDatabase();
      if (db) {
        const ping = await db.command({ ping: 1 });
        return {
          connected: ping.ok === 1,
          name: db.databaseName,
        };
      }
      return { connected: false, error: 'Database instance null (using memory fallback)' };
    })(),
    checkOcrHealth(),
  ]);

  const database = dbResult.status === 'fulfilled' ? dbResult.value : { connected: false, error: 'Database ping failed' };
  const ocr_backend = ocrResult.status === 'fulfilled' ? ocrResult.value : { status: 'offline' };

  const isHealthy = database.connected && ocr_backend.status !== 'offline';
  const overallStatus = isHealthy ? 'healthy' : 'degraded';

  return NextResponse.json(
    {
      status: overallStatus,
      database,
      ocr_backend,
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}
