/**
 * MongoDB Performance & Query Monitoring Logger
 * Tracks execution durations, slow queries (>100ms), and errors with safe PII/credential sanitization.
 */

const SLOW_QUERY_THRESHOLD_MS = parseInt(process.env.MONGODB_SLOW_QUERY_THRESHOLD_MS || '100', 10);
const LOG_LEVEL = process.env.MONGODB_LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'info');

export function sanitizeDbDetails(details: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ['password', 'secret', 'token', 'key', 'razorpay_signature', 'authorization', 'cookie'];

  for (const [key, value] of Object.entries(details)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeDbDetails(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export async function measureDbQuery<T>(
  queryName: string,
  operation: () => Promise<T>,
  metadata: Record<string, unknown> = {}
): Promise<T> {
  const start = performance.now();
  try {
    const result = await operation();
    const duration = Math.round((performance.now() - start) * 100) / 100;

    if (duration >= SLOW_QUERY_THRESHOLD_MS) {
      console.warn(
        `🐢 [MongoDB SLOW QUERY] ${queryName} took ${duration}ms (Threshold: ${SLOW_QUERY_THRESHOLD_MS}ms)`,
        sanitizeDbDetails(metadata)
      );
    } else if (LOG_LEVEL === 'debug') {
      console.debug(`⚡ [MongoDB] ${queryName} completed in ${duration}ms`);
    }

    return result;
  } catch (err) {
    const duration = Math.round((performance.now() - start) * 100) / 100;
    const error = err as Error;
    console.error(
      `❌ [MongoDB Errore] ${queryName} failed after ${duration}ms: ${error.message}`,
      sanitizeDbDetails(metadata)
    );
    throw err;
  }
}
