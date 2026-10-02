import {
  ExtractionResponse,
  BatchResponse,
  DocumentListResponse,
  ConsolidateRequest,
  ConsolidateResponse,
  ExportFormat,
  DocumentType,
  SupportedLanguage,
  OCRJob,
  OCRJobUploadResponse,
  AdminStats,
  AdminJobsResponse,
} from '@/types/ocr';

const API_BASE_URL = process.env.OCR_API_BASE_URL || 'http://localhost:8000/api/v1';
const API_KEY = process.env.OCR_API_KEY || 'ocr_dev_key_secret_2026';
const ADMIN_API_KEY = process.env.OCR_ADMIN_KEY || 'ocr_admin_secret_2026';

export interface ExtractOptions {
  documentType?: DocumentType;
  language?: SupportedLanguage;
  cleanWithAi?: boolean;
  requestId?: string;
  password?: string;
  callbackUrl?: string;
  callbackSecret?: string;
  userEmail?: string;
}

/**
 * 1. Extract structured data from a single document via FastAPI OCR service
 */
export async function extractDocument(
  file: File | Blob,
  fileName: string,
  options: ExtractOptions = {}
): Promise<ExtractionResponse> {
  const formData = new FormData();
  formData.append('file', file, fileName);
  formData.append('document_type', options.documentType || 'auto');
  formData.append('language', options.language || 'en');
  formData.append('clean_with_ai', options.cleanWithAi !== false ? 'true' : 'false');

  if (options.userEmail) formData.append('user_email', options.userEmail);
  if (options.requestId) formData.append('request_id', options.requestId);
  if (options.password) formData.append('password', options.password);
  if (options.callbackUrl) formData.append('callback_url', options.callbackUrl);
  if (options.callbackSecret) formData.append('callback_secret', options.callbackSecret);

  try {
    const response = await fetch(`${API_BASE_URL}/ocr/extract`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Check if error is password required
      if (response.status === 400 || response.status === 422 || response.status === 401) {
        if (errorText.toLowerCase().includes('password') || errorText.toLowerCase().includes('encrypted')) {
          const err = new Error('PDF is password protected. Please provide a password.');
          (err as unknown as { code: string }).code = 'PASSWORD_REQUIRED';
          throw err;
        }
      }
      throw new Error(`OCR Extraction failed (${response.status}): ${errorText}`);
    }

    const data: ExtractionResponse = await response.json();
    data.filename = fileName;
    return data;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.code === 'PASSWORD_REQUIRED') {
      throw err;
    }
    throw new Error(error.message || 'Failed to extract document from OCR service');
  }
}

/**
 * 2. Concurrently batch extract multiple files or .zip archive via FastAPI OCR service
 */
export async function batchExtractDocuments(
  files: (File | Blob)[],
  fileNames: string[],
  options: ExtractOptions = {}
): Promise<BatchResponse> {
  const formData = new FormData();
  files.forEach((f, idx) => {
    formData.append('files', f, fileNames[idx] || `file_${idx}.pdf`);
  });
  formData.append('document_type', options.documentType || 'auto');
  formData.append('language', options.language || 'en');
  formData.append('clean_with_ai', options.cleanWithAi !== false ? 'true' : 'false');
  if (options.userEmail) formData.append('user_email', options.userEmail);

  const response = await fetch(`${API_BASE_URL}/ocr/batch`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Batch extraction failed (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * 3. List stored document extractions from backend
 */
export async function fetchDocumentHistory(
  page = 1,
  pageSize = 20,
  documentType = 'all',
  search = ''
): Promise<DocumentListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (documentType && documentType !== 'all') params.append('document_type', documentType);
  if (search) params.append('search', search);

  const response = await fetch(`${API_BASE_URL}/documents?${params.toString()}`, {
    headers: { 'X-API-Key': API_KEY },
  });

  if (!response.ok) {
    throw new Error(`Fetch history failed: ${response.status}`);
  }

  return await response.json();
}

/**
 * 4. Retrieve single extraction details
 */
export async function fetchDocumentById(id: string): Promise<ExtractionResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      headers: { 'X-API-Key': API_KEY },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * 5. Delete document
 */
export async function deleteDocument(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': API_KEY },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 6. Download file export (.xlsx, .pdf, .csv, .ofx, .qbo, .qif)
 */
export async function downloadExportFile(documentId: string, format: ExportFormat = 'xlsx'): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/export/download/${documentId}?format=${format}`, {
    headers: { 'X-API-Key': API_KEY },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Download export failed (${response.status}): ${errText}`);
  }

  return await response.blob();
}

/**
 * 6.5. Generate export file directly from extraction JSON payload
 */
export async function generateExportDirect(
  format: ExportFormat,
  extraction: Record<string, unknown>,
  id = 'export_doc',
  documentType = 'bank_statement',
  rawText = ''
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/export/generate?format=${format}`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      document_type: documentType,
      extraction,
      raw_text: rawText,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Direct export generation failed (${response.status}): ${errText}`);
  }

  return await response.blob();
}

/**
 * 7. Consolidate multiple monthly statements into annual P&L
 */
export async function consolidateStatements(
  request: ConsolidateRequest,
  asExcel = false
): Promise<ConsolidateResponse | Blob> {
  const response = await fetch(`${API_BASE_URL}/export/consolidate?as_excel=${asExcel ? 'true' : 'false'}`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Consolidation failed (${response.status}): ${errText}`);
  }

  if (asExcel) return await response.blob();
  return await response.json();
}

/**
 * Health check
 */
export async function checkOcrHealth(): Promise<{ status: string; api_version?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      return { status: 'offline' };
    }
    return await response.json();
  } catch {
    return { status: 'offline' };
  }
}

/**
 * 8. Asynchronously upload a long document (100–200 pages) for background processing
 */
export async function uploadAsyncJob(
  file: File | Blob,
  fileName: string,
  options: ExtractOptions = {}
): Promise<OCRJobUploadResponse> {
  const formData = new FormData();
  formData.append('file', file, fileName);
  formData.append('document_type', options.documentType || 'auto');
  formData.append('language', options.language || 'en');
  formData.append('clean_with_ai', options.cleanWithAi !== false ? 'true' : 'false');

  if (options.userEmail) formData.append('user_email', options.userEmail);
  if (options.requestId) formData.append('request_id', options.requestId);
  if (options.password) formData.append('password', options.password);
  if (options.callbackUrl) formData.append('callback_url', options.callbackUrl);
  if (options.callbackSecret) formData.append('callback_secret', options.callbackSecret);

  const response = await fetch(`${API_BASE_URL}/jobs/upload`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 400 || response.status === 422 || response.status === 401) {
      if (errorText.toLowerCase().includes('password') || errorText.toLowerCase().includes('encrypted')) {
        const err = new Error('PDF is password protected. Please provide a password.');
        (err as unknown as { code: string }).code = 'PASSWORD_REQUIRED';
        throw err;
      }
    }
    throw new Error(`Async upload failed (${response.status}): ${errorText}`);
  }

  return await response.json();
}

/**
 * 9. Fetch async job progress status
 */
export async function fetchJobStatus(jobId: string): Promise<OCRJob> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    headers: {
      'X-API-Key': API_KEY,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Fetch job status failed (${response.status}): ${errText}`);
  }

  return await response.json();
}

/**
 * 10. Cancel an active or queued background job
 */
export async function cancelJob(jobId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/cancel`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 11. Retry a failed background job
 */
export async function retryJob(jobId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/retry`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 12. Get direct SSE URL for job events
 */
export function getJobEventsUrl(jobId: string): string {
  return `${API_BASE_URL}/jobs/${jobId}/events`;
}

/**
 * 13. Admin Dashboard & System Monitoring: Get real-time system metrics, worker health, and job statistics
 */
export async function fetchAdminStats(): Promise<AdminStats> {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: {
      'X-API-Key': ADMIN_API_KEY,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Fetch admin stats failed (${response.status}): ${errText}`);
  }

  return await response.json();
}

/**
 * 14. Admin Dashboard: List and inspect all system background jobs (Admin View)
 */
export async function fetchAdminJobs(
  page = 1,
  pageSize = 20,
  status = 'all',
  search = ''
): Promise<AdminJobsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (status && status !== 'all') params.append('status', status);
  if (search) params.append('search', search);

  const response = await fetch(`${API_BASE_URL}/admin/jobs?${params.toString()}`, {
    headers: {
      'X-API-Key': ADMIN_API_KEY,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Fetch admin jobs failed (${response.status}): ${errText}`);
  }

  return await response.json();
}

/**
 * 15. Admin Dashboard: Global SSE stream URL for real-time operations dashboard
 */
export function getAdminEventsUrl(): string {
  return `${API_BASE_URL}/admin/events`;
}


