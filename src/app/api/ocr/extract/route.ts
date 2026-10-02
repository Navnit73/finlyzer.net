import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractDocument } from '@/lib/ocr-api';
import { saveDocumentExtraction } from '@/lib/models/Document';
import { incrementUserPageCount, getUserQuota } from '@/lib/models/User';
import { DocumentType, SupportedLanguage } from '@/types/ocr';

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

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 10-Page Free Tier Policy Check
    const quota = await getUserQuota(userEmail);

    // If guest (not logged in) and document is more than 10 pages -> prompt login
    if (!userEmail && estimatedPages > 10) {
      return NextResponse.json(
        {
          error: 'Documents larger than 10 pages require a free account. Please log in with Google to continue.',
          code: 'LOGIN_REQUIRED',
          pageCount: estimatedPages,
        },
        { status: 403 }
      );
    }

    // If logged in free tier and exceeds free pages limit
    if (userEmail && quota.tier === 'free' && estimatedPages > quota.freePagesRemaining && quota.freePagesRemaining <= 0) {
      return NextResponse.json(
        {
          error: 'You have reached your 10 free pages quota. Please upgrade to Pro for unlimited document processing.',
          code: 'QUOTA_EXCEEDED',
          freePagesRemaining: quota.freePagesRemaining,
        },
        { status: 403 }
      );
    }

    // Extract via OCR Client (calls OCR API or smart fallback)
    const result = await extractDocument(file, file.name, {
      documentType,
      language,
      cleanWithAi,
      password,
    });

    const actualPages = result.metadata?.pages || estimatedPages || 1;

    // Check if result has more than 10 pages and user is not logged in
    if (!userEmail && actualPages > 10) {
      return NextResponse.json(
        {
          error: `Document has ${actualPages} pages (Free guest limit is 10 pages). Please log in with Google to view and save full results.`,
          code: 'LOGIN_REQUIRED',
          pageCount: actualPages,
          previewId: result.id,
        },
        { status: 403 }
      );
    }

    // Always persist extraction to MongoDB (both for authenticated users and free guest users up to 10 pages)
    try {
      const effectiveEmail = userEmail || 'guest';
      await saveDocumentExtraction(effectiveEmail, result, file.name);
      if (userEmail) {
        await incrementUserPageCount(userEmail, actualPages);
      }
    } catch (dbErr) {
      console.warn('Could not save extraction to database:', dbErr);
    }

    return NextResponse.json(result);
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
      { error: error.message || 'Internal server error during OCR processing' },
      { status: 500 }
    );
  }
}
