import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { extractDocument } from '@/lib/ocr-api';
import { saveDocumentExtraction } from '@/lib/models/Document';
import { incrementUserPageCount, getUserQuota } from '@/lib/models/User';
import { DocumentType, SupportedLanguage } from '@/types/ocr';
import { errorResponse, successResponse } from '@/lib/api-utils';

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
    const estimatedPages = Math.max(1, parseInt((formData.get('page_count') as string) || '1', 10) || 1);

    if (!file) {
      return errorResponse('No document file provided', 400, 'NO_FILE');
    }

    // Server-Side File Size Limit (Max 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('File exceeds maximum upload size of 50MB', 413, 'FILE_TOO_LARGE');
    }

    // Server-Side MIME Type & Extension Whitelist
    // Spreadsheets (CSV / Excel) are parsed by the OCR service for the CSV & Excel to QBO converter.
    const ALLOWED_MIME = [
      'application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/tiff',
      'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const ALLOWED_EXTS = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff', '.csv', '.xlsx', '.xls'];
    const ext = file.name ? file.name.substring(file.name.lastIndexOf('.')).toLowerCase() : '';

    if (!ALLOWED_EXTS.includes(ext) && file.type && !ALLOWED_MIME.includes(file.type.toLowerCase())) {
      return errorResponse(
        'Unsupported file format. Please upload a PDF, PNG, JPG, WEBP, TIFF, CSV, XLSX or XLS file.',
        415,
        'UNSUPPORTED_MEDIA_TYPE'
      );
    }

    // 2. Guest vs Authenticated User Policy Check
    const quota = await getUserQuota(userEmail);

    // If guest (not logged in) and document is > 30 pages -> require login/account
    if (!userEmail && estimatedPages > 30) {
      return errorResponse(
        'Documents over 30 pages require a registered account. Please sign in with Google to process up to 200 pages.',
        403,
        'LOGIN_REQUIRED',
        { pageCount: estimatedPages, maxGuestPages: 30 }
      );
    }

    // Page Credits Quota Check for Authenticated Users
    if (userEmail && estimatedPages > quota.freePagesRemaining) {
      return errorResponse(
        `Insufficient page credits. This document requires ${estimatedPages} page credits, but your account only has ${quota.freePagesRemaining} remaining. Please top up your balance.`,
        403,
        'QUOTA_EXCEEDED',
        {
          freePagesRemaining: quota.freePagesRemaining,
          requiredPages: estimatedPages,
        }
      );
    }

    // Extract via OCR Client (calls OCR API or smart fallback)
    const result = await extractDocument(file, file.name, {
      documentType,
      language,
      cleanWithAi,
      password,
      userEmail: userEmail || 'guest',
    });

    const actualPages = result.metadata?.pages || estimatedPages || 1;

    // If guest and actual parsed pages > 30 -> enforce login requirement
    if (!userEmail && actualPages > 30) {
      return errorResponse(
        `This document contains ${actualPages} pages. Documents over 30 pages require a registered account. Please log in with Google.`,
        403,
        'LOGIN_REQUIRED',
        {
          pageCount: actualPages,
          previewId: result.id,
          maxGuestPages: 30,
        }
      );
    }

    const isGuest = !userEmail;
    // For guests: 1-10 pages = free download (isPaid=true); 11-30 pages = pay to download (isPaid=false)
    const isPaid = isGuest ? actualPages <= 10 : true;

    result.is_paid = isPaid;
    result.is_guest = isGuest;

    // Persist extraction to MongoDB and increment page count if authenticated
    try {
      const effectiveEmail = userEmail || 'guest';
      await saveDocumentExtraction(effectiveEmail, result, file.name, {
        isGuest,
        isPaid,
      });

      if (userEmail) {
        await incrementUserPageCount(userEmail, actualPages);
      }
    } catch (dbErr) {
      console.warn('Could not save extraction to database:', (dbErr as Error)?.message || 'DB Error');
    }

    return successResponse({
      ...result,
      is_paid: isPaid,
      is_guest: isGuest,
      download_eligible: isPaid,
      requires_payment_to_download: isGuest && !isPaid,
    });
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.code === 'PASSWORD_REQUIRED') {
      return errorResponse('This PDF file is password protected. Please provide a password.', 401, 'PASSWORD_REQUIRED');
    }

    return errorResponse(error.message || 'Internal server error during OCR processing', 500);
  }
}
