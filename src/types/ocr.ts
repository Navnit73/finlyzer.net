export type DocumentType = 'auto' | 'bank_statement' | 'invoice' | 'receipt' | 'general';
export type SupportedLanguage = 'auto' | 'en' | 'hi' | 'es' | 'fr' | 'de' | 'ch';
export type ExportFormat = 'xlsx' | 'pdf' | 'csv' | 'ofx' | 'qbo' | 'qif';

export interface Transaction {
  date: string;
  description: string;
  reference?: string | null;
  debit?: number | null;
  credit?: number | null;
  balance?: number | null;
  category?: string | null;
}

export interface BankStatementData {
  bank_name?: string | null;
  account_holder?: string | null;
  account_number_masked?: string | null;
  account_type?: string | null;
  currency?: string | null;
  statement_period?: string | null;
  opening_balance?: number | null;
  closing_balance?: number | null;
  total_deposits?: number | null;
  total_withdrawals?: number | null;
  transactions?: Transaction[];
}

export interface InvoiceItem {
  description: string;
  quantity?: number;
  unit_price?: number;
  amount?: number;
}

export interface InvoiceData {
  vendor_name?: string | null;
  invoice_number?: string | null;
  invoice_date?: string | null;
  due_date?: string | null;
  currency?: string | null;
  subtotal?: number | null;
  tax_amount?: number | null;
  total_amount?: number | null;
  items?: InvoiceItem[];
}

export interface ReceiptData {
  merchant_name?: string | null;
  date?: string | null;
  total_amount?: number | null;
  subtotal?: number | null;
  currency?: string | null;
  tax?: number | null;
  payment_method?: string | null;
  items?: InvoiceItem[];
}

export interface PageInfo {
  page_number: number;
  text: string;
  confidence?: number;
  is_scanned?: boolean;
  lines?: string[];
}

export interface StageTimings {
  validation?: number;
  ocr_extraction?: number;
  ai_cleaning?: number;
  classification?: number;
  structured_extraction?: number;
}

export interface ExtractionMetadata {
  pages: number;
  ocr_used?: boolean;
  ocr_engine?: string;
  ai_cleaned?: boolean;
  ai_model?: string;
  processing_time_ms?: number;
  stage_timings_ms?: StageTimings;
}

export interface ExtractionResponse {
  id: string;
  status: 'success' | 'processing' | 'error' | 'queued';
  document_type: DocumentType;
  extraction: BankStatementData & InvoiceData & ReceiptData & Record<string, unknown>;
  raw_text?: string;
  cleaned_text?: string;
  pages?: PageInfo[];
  metadata: ExtractionMetadata;
  warnings?: string[];
  filename?: string;
  created_at?: string;
}

export interface BatchItem {
  id: string;
  filename: string;
  status: 'success' | 'error' | 'processing';
  document_type: DocumentType;
  extraction?: BankStatementData & Record<string, unknown>;
  raw_text?: string;
  processing_time_ms?: number;
  error?: string;
}

export interface BatchResponse {
  batch_id: string;
  total_files: number;
  successful_count: number;
  failed_count: number;
  total_processing_time_ms: number;
  consolidated_inflow?: number;
  consolidated_outflow?: number;
  net_consolidated_savings?: number;
  items: BatchItem[];
}

export interface StoredDocument {
  id: string;
  userId?: string;
  document_type: DocumentType;
  status: 'success' | 'processing' | 'error' | 'queued';
  created_at: string;
  filename: string;
  pages: number;
  extraction: BankStatementData & Record<string, unknown>;
  metadata: ExtractionMetadata;
}

export interface DocumentListResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: StoredDocument[];
}

export interface ConsolidateRequest {
  title?: string;
  request_ids: string[];
}

export interface MonthlyBreakdown {
  month: string;
  inflow: number;
  outflow: number;
  net_savings: number;
  transaction_count: number;
}

export interface ConsolidateResponse {
  title: string;
  total_statements: number;
  total_inflow: number;
  total_outflow: number;
  net_annual_savings: number;
  monthly_breakdown: MonthlyBreakdown[];
}

export interface UserQuota {
  isLoggedIn: boolean;
  userEmail?: string | null;
  userName?: string | null;
  userImage?: string | null;
  tier: 'free' | 'pro' | 'enterprise';
  freePagesRemaining: number;
  totalPagesProcessed: number;
  maxFreePages: number;
}
