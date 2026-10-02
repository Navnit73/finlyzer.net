import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { checkOcrHealth } from '@/lib/ocr-api';

export async function GET() {
  const result: {
    status: string;
    database: { connected: boolean; name?: string; error?: string };
    ocr_backend: { status: string };
    timestamp: string;
  } = {
    status: 'healthy',
    database: { connected: false },
    ocr_backend: { status: 'unknown' },
    timestamp: new Date().toISOString(),
  };

  try {
    const db = await getDatabase();
    if (db) {
      const ping = await db.command({ ping: 1 });
      result.database = {
        connected: ping.ok === 1,
        name: db.databaseName,
      };
    }
  } catch (err: unknown) {
    const error = err as { message?: string };
    result.database = {
      connected: false,
      error: error.message || 'Database unreachable',
    };
  }

  try {
    const ocrStatus = await checkOcrHealth();
    result.ocr_backend = ocrStatus;
  } catch {
    result.ocr_backend = { status: 'offline' };
  }

  return NextResponse.json(result);
}
