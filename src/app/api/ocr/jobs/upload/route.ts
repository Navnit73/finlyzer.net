import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserQuota } from '@/lib/models/User';
import { uploadAsyncJob } from '@/lib/ocr-api';
import { DocumentType, SupportedLanguage } from '@/types/ocr';

const WEBHOOK_SECRET = process.env.OCR_WEBHOOK_SECRET || 'ocr_webhook_secret_2026';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentType = (formData.get('document_type') as DocumentType) || 'auto';
    const language = (formData.get('language') as SupportedLanguage) || 'en';
    const cleanWithAi = formData.get('clean_with_ai') !== 'false';
    const password = (formData.get('password') as string) || undefined;
    const estimatedPages = parseInt((formData.get('page_count') as string) || '1', 10);
    const customRequestId = (formData.get('request_id') as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: 'No document file provided' }, { status: 400 });
    }

    // 1. File Size & Format Validation (Support up to 100MB for long documents)
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File exceeds maximum upload size of 100MB for long document processing' },
        { status: 413 }
      );
    }

    const ALLOWED_MIME = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/tiff'];
    const ALLOWED_EXTS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff'];
    const ext = file.name ? file.name.substring(file.name.lastIndexOf('.')).toLowerCase() : '';

    if (!ALLOWED_EXTS.includes(ext) && file.type && !ALLOWED_MIME.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload a PDF, PNG, JPG, WEBP, or TIFF document.' },
        { status: 415 }
      );
    }

    // 2. User Quota & Login Verification for Long Documents (>10 pages)
    const quota = await getUserQuota(userEmail);

    if (!userEmail && estimatedPages > 10) {
      return NextResponse.json(
        {
          error: 'Long documents (10+ pages) require a free registered account. Please sign in with Google.',
          code: 'LOGIN_REQUIRED',
          pageCount: estimatedPages,
        },
        { status: 403 }
      );
    }

    if (userEmail && quota.tier !== 'enterprise' && estimatedPages > quota.freePagesRemaining) {
      return NextResponse.json(
        {
          error: `Insufficient page balance. This document requires approximately ${estimatedPages} page credits, but your account only has ${quota.freePagesRemaining} remaining.`,
          code: 'QUOTA_EXCEEDED',
          freePagesRemaining: quota.freePagesRemaining,
          requiredPages: estimatedPages,
        },
        { status: 403 }
      );
    }

    // 3. Determine Dynamic Webhook URL
    const host = req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    const callbackUrl = `${proto}://${host}/api/ocr/webhook`;

    // 4. Dispatch Async Job to Python OCR Advance API Worker Engine
    const jobResponse = await uploadAsyncJob(file, file.name, {
      documentType,
      language,
      cleanWithAi,
      password,
      requestId: customRequestId,
      callbackUrl,
      callbackSecret: WEBHOOK_SECRET,
      userEmail: userEmail || 'guest',
    });

    // 5. Pre-record initial document state in MongoDB so it is visible immediately in Vault
    if (jobResponse?.document_id) {
      try {
        const { getDatabase } = await import('@/lib/mongodb');
        const db = await getDatabase();
        if (db) {
          const effectiveEmail = (userEmail || 'guest').toLowerCase().trim();
          await db.collection('extractions').updateOne(
            { id: jobResponse.document_id },
            {
              $set: {
                id: jobResponse.document_id,
                job_id: jobResponse.job_id,
                user_email: effectiveEmail,
                document_type: documentType,
                filename: file.name,
                pages: estimatedPages,
                status: 'processing',
                extraction: {},
                metadata: { pages: estimatedPages, job_id: jobResponse.job_id },
                created_at: new Date().toISOString(),
              },
            },
            { upsert: true }
          );
        }
      } catch (dbErr) {
        console.warn('⚠️ Could not pre-record initial document state in MongoDB:', (dbErr as Error).message);
      }
    }

    return NextResponse.json(jobResponse, { status: 202 });
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.code === 'PASSWORD_REQUIRED') {
      return NextResponse.json(
        {
          error: 'This PDF file is password protected. Please provide a password.',
          code: 'PASSWORD_REQUIRED',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to initialize asynchronous document processing' },
      { status: 500 }
    );
  }
}
