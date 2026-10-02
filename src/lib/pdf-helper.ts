export interface PdfInspectionResult {
  isPdf: boolean;
  pageCount: number;
  isEncrypted: boolean;
  error?: string;
}

/**
 * Ultra-fast, non-blocking client-side inspection of a PDF file.
 * Avoids heavy object tree parsing on the main JS thread for 100+ page files.
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
    // 1. Read first 64KB and last 64KB of the file for instant header/trailer inspection
    const fileSize = file.size;
    const headerChunkSize = Math.min(fileSize, 65536);
    const trailerChunkSize = Math.min(fileSize, 65536);

    const headerBlob = file.slice(0, headerChunkSize);
    const trailerBlob = file.slice(Math.max(0, fileSize - trailerChunkSize), fileSize);

    const [headerText, trailerText] = await Promise.all([
      headerBlob.text().catch(() => ''),
      trailerBlob.text().catch(() => ''),
    ]);

    const combinedText = headerText + '\n' + trailerText;

    // Check encryption: presence of /Encrypt in header, trailer or dictionary
    const isEncrypted = /\/Encrypt\b/i.test(combinedText);
    if (isEncrypted) {
      return {
        isPdf: true,
        pageCount: 1, // Determined after server-side decryption
        isEncrypted: true,
      };
    }

    // Fast detection of /Count in /Pages dictionary
    // Usually formatted as: /Type /Pages /Count 100 or /Count 100 /Type /Pages
    const countMatches = combinedText.match(/\/Count\s+(\d+)/g);
    if (countMatches && countMatches.length > 0) {
      let maxCount = 1;
      for (const m of countMatches) {
        const num = parseInt(m.replace(/\/Count\s+/, ''), 10);
        if (!isNaN(num) && num > maxCount) {
          maxCount = num;
        }
      }
      if (maxCount > 1) {
        return {
          isPdf: true,
          pageCount: maxCount,
          isEncrypted: false,
        };
      }
    }

    // 2. Fallback for linear / non-standard PDFs: fast token scan across the buffer
    // For small files (< 5MB), we can do a quick whole-file text regex or pdf-lib fallback
    if (fileSize < 5 * 1024 * 1024) {
      const fullText = await file.text().catch(() => '');
      const pageMatches = fullText.match(/\/Type\s*\/Page\b/g);
      if (pageMatches && pageMatches.length > 0) {
        return {
          isPdf: true,
          pageCount: pageMatches.length,
          isEncrypted: false,
        };
      }
    }

    // If estimated from file size (average ~100KB per page in financial statements)
    const estimatedPages = Math.max(1, Math.min(200, Math.round(fileSize / (150 * 1024))));

    return {
      isPdf: true,
      pageCount: estimatedPages,
      isEncrypted: false,
    };
  } catch (err: unknown) {
    const message = (err as Error).message || '';
    return {
      isPdf: true,
      pageCount: 1,
      isEncrypted: false,
      error: message,
    };
  }
}
