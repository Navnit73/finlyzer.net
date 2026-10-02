import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { batchExtractDocuments } from '@/lib/ocr-api';
import { saveDocumentExtraction } from '@/lib/models/Document';
import { incrementUserPageCount, getUserQuota } from '@/lib/models/User';
import { DocumentType, SupportedLanguage } from '@/types/ocr';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    // Bulk uploads require user to login with Google
    if (!userEmail) {
      return NextResponse.json(
        {
          error: 'Bulk batch document processing requires a free account. Please log in with Google to continue.',
          code: 'LOGIN_REQUIRED',
        },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const documentType = (formData.get('document_type') as DocumentType) || 'auto';
    const language = (formData.get('language') as SupportedLanguage) || 'en';
    const cleanWithAi = formData.get('clean_with_ai') !== 'false';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided for batch processing' }, { status: 400 });
    }

    const quota = await getUserQuota(userEmail);
    if (quota.tier !== 'enterprise' && files.length > quota.freePagesRemaining) {
      return NextResponse.json(
        {
          error: `Insufficient page credits. This batch has ${files.length} documents, but your account only has ${quota.freePagesRemaining} remaining credits. Please top up your package.`,
          code: 'QUOTA_EXCEEDED',
          freePagesRemaining: quota.freePagesRemaining,
          requiredPages: files.length,
        },
        { status: 403 }
      );
    }

    const fileNames = files.map(f => f.name);
    const batchResult = await batchExtractDocuments(files, fileNames, {
      documentType,
      language,
      cleanWithAi,
    });

    // Save batch document items to MongoDB
    if (batchResult.items && batchResult.items.length > 0) {
      for (const item of batchResult.items) {
        if (item.status === 'success' && item.extraction) {
          try {
            await saveDocumentExtraction(userEmail, {
              id: item.id,
              status: 'success',
              document_type: item.document_type,
              extraction: item.extraction,
              raw_text: item.raw_text,
              metadata: { pages: 1, processing_time_ms: item.processing_time_ms },
            }, item.filename);
          } catch (e) {
            console.warn('Batch item save failed:', e);
          }
        }
      }
      await incrementUserPageCount(userEmail, batchResult.items.length);
    }

    return NextResponse.json(batchResult);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { error: error.message || 'Batch OCR processing failed' },
      { status: 500 }
    );
  }
}
