import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { batchExtractDocuments } from '@/lib/ocr-api';
import { saveDocumentExtraction } from '@/lib/models/Document';
import { incrementUserPageCount, getUserQuota } from '@/lib/models/User';
import { DocumentType, SupportedLanguage } from '@/types/ocr';
import { errorResponse, successResponse } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;

    // Bulk uploads require user to login with Google
    if (!userEmail) {
      return errorResponse(
        'Bulk batch document processing requires a free account. Please log in with Google to continue.',
        403,
        'LOGIN_REQUIRED'
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const documentType = (formData.get('document_type') as DocumentType) || 'auto';
    const language = (formData.get('language') as SupportedLanguage) || 'en';
    const cleanWithAi = formData.get('clean_with_ai') !== 'false';

    if (!files || files.length === 0) {
      return errorResponse('No files provided for batch processing', 400, 'NO_FILES');
    }

    // Limit maximum batch size (max 50 files)
    if (files.length > 50) {
      return errorResponse('Batch upload limit exceeded. Maximum 50 documents per batch.', 400, 'BATCH_LIMIT_EXCEEDED');
    }

    // Server-Side File Size Limit (Max 50MB per file) & Format Whitelist
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    const ALLOWED_MIME = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/tiff', 'application/zip', 'application/x-zip-compressed'];
    const ALLOWED_EXTS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff', '.zip'];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return errorResponse(`File "${file.name}" exceeds maximum upload size of 50MB.`, 413, 'FILE_TOO_LARGE');
      }
      const ext = file.name ? file.name.substring(file.name.lastIndexOf('.')).toLowerCase() : '';
      if (!ALLOWED_EXTS.includes(ext) && file.type && !ALLOWED_MIME.includes(file.type.toLowerCase())) {
        return errorResponse(
          `File "${file.name}" has an unsupported format. Please upload PDF, PNG, JPG, WEBP, TIFF, or ZIP files.`,
          415,
          'UNSUPPORTED_MEDIA_TYPE'
        );
      }
    }

    const quota = await getUserQuota(userEmail);
    if (files.length > quota.freePagesRemaining) {
      return errorResponse(
        `Insufficient page credits. This batch has ${files.length} documents, but your account only has ${quota.freePagesRemaining} remaining credits. Please top up your package.`,
        403,
        'QUOTA_EXCEEDED',
        {
          freePagesRemaining: quota.freePagesRemaining,
          requiredPages: files.length,
        }
      );
    }

    const fileNames = files.map((f) => f.name);
    const batchResult = await batchExtractDocuments(files, fileNames, {
      documentType,
      language,
      cleanWithAi,
      userEmail,
    });

    // Concurrently save batch document items to MongoDB
    if (batchResult.items && batchResult.items.length > 0) {
      const successfulItems = batchResult.items.filter((item) => item.status === 'success' && item.extraction);
      await Promise.allSettled(
        successfulItems.map((item) =>
          saveDocumentExtraction(
            userEmail,
            {
              id: item.id,
              status: 'success',
              document_type: item.document_type,
              extraction: item.extraction!,
              raw_text: item.raw_text,
              metadata: { pages: 1, processing_time_ms: item.processing_time_ms },
            },
            item.filename
          )
        )
      );

      await incrementUserPageCount(userEmail, successfulItems.length);
    }

    return successResponse(batchResult);
  } catch (err: unknown) {
    const error = err as { message?: string };
    return errorResponse(error.message || 'Batch OCR processing failed', 500);
  }
}
