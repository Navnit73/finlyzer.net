import { PDFDocument } from 'pdf-lib';

export interface PdfInspectionResult {
  isPdf: boolean;
  pageCount: number;
  isEncrypted: boolean;
  error?: string;
}

/**
 * Quick client-side inspection of a PDF file to detect page count and encryption
 */
export async function inspectPdfFile(file: File): Promise<PdfInspectionResult> {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return {
      isPdf: false,
      pageCount: 1,
      isEncrypted: false,
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    // Try to load PDF document
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: false });
    const pageCount = pdfDoc.getPageCount();
    return {
      isPdf: true,
      pageCount,
      isEncrypted: false,
    };
  } catch (err: unknown) {
    const message = (err as Error).message || '';
    if (
      message.toLowerCase().includes('password') ||
      message.toLowerCase().includes('encrypted') ||
      message.toLowerCase().includes('encrypt')
    ) {
      return {
        isPdf: true,
        pageCount: 1, // Will be known after password decryption
        isEncrypted: true,
      };
    }

    // Fallback: estimate from raw buffer header/trailer if possible
    return {
      isPdf: true,
      pageCount: 1,
      isEncrypted: false,
      error: message,
    };
  }
}
