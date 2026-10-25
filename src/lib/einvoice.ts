/**
 * Shared types and helpers for the German e-invoice tool (/de/konverter/e-rechnung). Pure data and
 * functions, so both the client components and the API proxy can import it.
 *
 * The backend (ocr.advance, /api/einvoice) recalculates every amount and rejects mismatches, so the
 * totals computed here are only for the live preview and the flat /convert form, which requires them.
 */

/** Mirrors the backend's EINVOICE_MAX_UPLOAD_SIZE_MB default. */
export const EINVOICE_MAX_UPLOAD_MB = 10;
export const EINVOICE_MAX_UPLOAD_BYTES = EINVOICE_MAX_UPLOAD_MB * 1024 * 1024;

export type EinvoiceFormat = 'zugferd' | 'xrechnung';

/** Simple = flat form via /convert; full = EInvoiceData via /create-zugferd or /create-xrechnung. */
export type FormMode = 'simple' | 'full';

export interface ValidationIssue {
  rule_id: string;
  field?: string | null;
  message: string;
  severity?: 'error' | 'warning';
  source?: string;
  line?: number | null;
  expected?: string | null;
  actual?: string | null;
}

export interface ValidationReport {
  valid: boolean;
  syntax?: string | null;
  profile?: string | null;
  profile_urn?: string | null;
  version?: string | null;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  checks: Record<string, string>;
  validated_at?: string;
}

export interface ArchiveFileInfo {
  role: string;
  filename: string;
  sha256: string;
  size: number;
  content_type: string;
}

export interface ArchiveInfo {
  archive_id: string;
  archived_at: string;
  entry_hash: string;
  files: ArchiveFileInfo[];
}

export interface ArchiveVerification extends ArchiveInfo {
  operation: string;
  invoice_number?: string | null;
  intact: boolean;
  problems: string[];
}

export interface ExtractResponse {
  filename: string;
  source_type: 'pdf' | 'xml';
  syntax?: string | null;
  profile?: string | null;
  profile_urn?: string | null;
  version?: string | null;
  embedded_filename?: string | null;
  xmp?: Record<string, string | null> | null;
  invoice?: Record<string, unknown> | null;
  raw_xml: string;
  warnings: ValidationIssue[];
  archive?: ArchiveInfo | null;
}

/* ---------------- Form model ---------------- */

export interface LineForm {
  id: string;
  description: string;
  quantity: string;
  unit: string;
  netPrice: string;
  vatRate: string;
}

export interface InvoiceForm {
  invoiceNumber: string;
  issueDate: string;
  deliveryDate: string;
  typeCode: string;
  orderReference: string;
  note: string;
  seller: {
    name: string;
    street: string;
    postcode: string;
    city: string;
    country: string;
    vatId: string;
    taxNumber: string;
    contactName: string;
    phone: string;
    email: string;
  };
  buyer: {
    name: string;
    street: string;
    postcode: string;
    city: string;
    country: string;
    vatId: string;
    email: string;
    leitwegId: string;
  };
  lines: LineForm[];
  payment: {
    dueDate: string;
    terms: string;
    iban: string;
    bic: string;
    reference: string;
    skontoDays: string;
    skontoPercent: string;
  };
}

/** Unit aliases the backend maps to UN/ECE Rec 20 codes. `labelEn` is for the tool's English UI. */
export const UNITS: { value: string; label: string; labelEn: string; code: string }[] = [
  { value: 'Stk', label: 'Stück', labelEn: 'Pieces', code: 'C62' },
  { value: 'Std', label: 'Stunden', labelEn: 'Hours', code: 'HUR' },
  { value: 'Tag', label: 'Tage', labelEn: 'Days', code: 'DAY' },
  { value: 'kg', label: 'Kilogramm', labelEn: 'Kilograms', code: 'KGM' },
  { value: 'pauschal', label: 'Pauschal', labelEn: 'Lump sum', code: 'LS' },
];

/** Standard-rated categories only; 0 % lines need an exemption reason the form doesn't collect. */
export const VAT_RATES = ['19', '7'];

export const TYPE_CODES: { value: string; label: string; labelEn: string }[] = [
  { value: '380', label: 'Rechnung', labelEn: 'Invoice' },
  { value: '381', label: 'Gutschrift', labelEn: 'Credit note' },
  { value: '384', label: 'Korrigierte Rechnung', labelEn: 'Corrected invoice' },
];

let lineCounter = 0;
export function newLine(partial: Partial<LineForm> = {}): LineForm {
  lineCounter += 1;
  return { id: `line-${lineCounter}`, description: '', quantity: '1', unit: 'Stk', netPrice: '', vatRate: '19', ...partial };
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function emptyInvoiceForm(): InvoiceForm {
  return {
    invoiceNumber: '',
    issueDate: today(),
    deliveryDate: today(),
    typeCode: '380',
    orderReference: '',
    note: '',
    seller: { name: '', street: '', postcode: '', city: '', country: 'DE', vatId: '', taxNumber: '', contactName: '', phone: '', email: '' },
    buyer: { name: '', street: '', postcode: '', city: '', country: 'DE', vatId: '', email: '', leitwegId: '' },
    lines: [newLine()],
    payment: { dueDate: '', terms: '', iban: '', bic: '', reference: '', skontoDays: '', skontoPercent: '' },
  };
}

/** The official ZUGFeRD sample invoice 471102 (same data as the backend's /docs examples). */
export function sampleInvoiceForm(): InvoiceForm {
  return {
    invoiceNumber: '471102',
    issueDate: '2018-03-05',
    deliveryDate: '2018-03-05',
    typeCode: '380',
    orderReference: '',
    note: 'Rechnung gemäß Bestellung vom 01.03.2018.',
    seller: {
      name: 'Lieferant GmbH',
      street: 'Lieferantenstraße 20',
      postcode: '80333',
      city: 'München',
      country: 'DE',
      vatId: 'DE123456789',
      taxNumber: '201/113/40209',
      contactName: 'Hans Muster',
      phone: '+49 89 1234567',
      email: 'rechnung@lieferant.de',
    },
    buyer: {
      name: 'Kunden AG Mitte',
      street: 'Kundenstraße 15',
      postcode: '69876',
      city: 'Frankfurt',
      country: 'DE',
      vatId: '',
      email: 'einkauf@kunden-ag.de',
      leitwegId: '04011000-1234512345-06',
    },
    lines: [
      newLine({ description: 'Trennblätter A4', quantity: '20', unit: 'Stk', netPrice: '9,90', vatRate: '19' }),
      newLine({ description: 'Joghurt Banane', quantity: '50', unit: 'Stk', netPrice: '5,50', vatRate: '7' }),
    ],
    payment: {
      dueDate: '2018-04-04',
      terms: 'Zahlbar innerhalb 30 Tagen netto bis 04.04.2018',
      iban: 'DE02120300000000202051',
      bic: 'BYLADEM1001',
      reference: '471102',
      skontoDays: '',
      skontoPercent: '',
    },
  };
}

/* ---------------- Numbers & totals ---------------- */

/** Parses "1.234,50", "1234,5" or "1234.5"; returns NaN for anything else. */
export function parseNumber(value: string): number {
  const s = value.replace(/\s/g, '');
  if (!s) return NaN;
  const normalized = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s;
  return /^-?\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
}

/** Commercial rounding to cents, half away from zero (the backend's ROUND_HALF_UP). */
export function round2(n: number): number {
  return (Math.sign(n) * Math.round((Math.abs(n) + 1e-9) * 100)) / 100;
}

const EUR = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
export function formatEuro(n: number): string {
  return EUR.format(Number.isFinite(n) ? n : 0);
}

export interface Totals {
  lineNets: number[];
  vat: { rate: number; basis: number; tax: number }[];
  net: number;
  vatTotal: number;
  gross: number;
}

/** Same order of rounding as the backend: per line, then per VAT rate (CALC-LINE-NET, BR-S-08/09, BR-CO-*). */
export function computeTotals(lines: LineForm[]): Totals {
  const lineNets = lines.map((l) => {
    const q = parseNumber(l.quantity);
    const p = parseNumber(l.netPrice);
    return Number.isFinite(q) && Number.isFinite(p) ? round2(q * p) : 0;
  });
  const byRate = new Map<number, number>();
  lines.forEach((l, i) => {
    const rate = parseNumber(l.vatRate);
    if (Number.isFinite(rate)) byRate.set(rate, round2((byRate.get(rate) ?? 0) + lineNets[i]));
  });
  const vat = [...byRate.entries()]
    .sort(([a], [b]) => b - a)
    .map(([rate, basis]) => ({ rate, basis, tax: round2((basis * rate) / 100) }));
  const net = round2(lineNets.reduce((a, b) => a + b, 0));
  const vatTotal = round2(vat.reduce((a, v) => a + v.tax, 0));
  return { lineNets, vat, net, vatTotal, gross: round2(net + vatTotal) };
}

/* ---------------- Payload builders ---------------- */

const opt = (v: string) => (v.trim() ? v.trim() : undefined);
const optNumber = (v: string) => {
  const n = parseNumber(v);
  return Number.isFinite(n) ? n : undefined;
};

function compact<T extends Record<string, unknown>>(obj: T): Partial<T> | undefined {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
  return entries.length ? (Object.fromEntries(entries) as Partial<T>) : undefined;
}

/** Full EInvoiceData for /create-zugferd and /create-xrechnung. Totals are left to the server. */
export function buildInvoicePayload(form: InvoiceForm, format: EinvoiceFormat): Record<string, unknown> {
  const { seller, buyer, payment } = form;
  return {
    invoice_number: form.invoiceNumber.trim(),
    issue_date: form.issueDate,
    type_code: form.typeCode,
    currency: 'EUR',
    delivery_date: opt(form.deliveryDate),
    order_reference: opt(form.orderReference),
    notes: form.note.trim() ? [form.note.trim()] : [],
    seller: compact({
      name: seller.name.trim(),
      address: compact({ street: opt(seller.street), postcode: opt(seller.postcode), city: opt(seller.city), country: seller.country.trim().toUpperCase() || 'DE' }),
      vat_id: opt(seller.vatId),
      tax_number: opt(seller.taxNumber),
      electronic_address: opt(seller.email),
      contact: compact({ name: opt(seller.contactName), phone: opt(seller.phone), email: opt(seller.email) }),
    }),
    buyer: compact({
      name: buyer.name.trim(),
      address: compact({ street: opt(buyer.street), postcode: opt(buyer.postcode), city: opt(buyer.city), country: buyer.country.trim().toUpperCase() || 'DE' }),
      vat_id: opt(buyer.vatId),
      buyer_reference: format === 'xrechnung' ? opt(buyer.leitwegId) : undefined,
      electronic_address: opt(buyer.email),
    }),
    lines: form.lines.map((l) => ({
      description: l.description.trim(),
      quantity: optNumber(l.quantity),
      unit: l.unit,
      net_price: optNumber(l.netPrice),
      vat_rate: optNumber(l.vatRate),
    })),
    payment: compact({
      due_date: opt(payment.dueDate),
      terms: opt(payment.terms),
      iban: opt(payment.iban)?.replace(/\s/g, ''),
      bic: opt(payment.bic),
      payment_reference: opt(payment.reference),
      discount_days: optNumber(payment.skontoDays),
      discount_percent: optNumber(payment.skontoPercent),
    }),
  };
}

function addressLine(p: { street: string; postcode: string; city: string; country: string }): string {
  return [p.street.trim(), `${p.postcode.trim()} ${p.city.trim()}`.trim(), p.country.trim().toUpperCase() || 'DE'].join(', ');
}

/** Flat InvoiceDataSchema for /convert. It requires the totals, so they are sent as computed here. */
export function buildFlatPayload(form: InvoiceForm, format: EinvoiceFormat): Record<string, unknown> {
  const totals = computeTotals(form.lines);
  const { seller, buyer, payment } = form;
  return {
    invoice_number: form.invoiceNumber.trim(),
    issue_date: form.issueDate,
    format_type: format === 'xrechnung' ? 'XRechnung' : 'ZUGFeRD',
    currency: 'EUR',
    delivery_date: opt(form.deliveryDate),
    seller_name: seller.name.trim(),
    seller_address: addressLine(seller),
    seller_vat_id: seller.vatId.trim(),
    seller_tax_number: opt(seller.taxNumber),
    seller_contact_name: opt(seller.contactName),
    seller_phone: opt(seller.phone),
    seller_email: opt(seller.email),
    buyer_name: buyer.name.trim(),
    buyer_address: addressLine(buyer),
    buyer_email: opt(buyer.email),
    routing_id: format === 'xrechnung' ? opt(buyer.leitwegId) : undefined,
    line_items: form.lines.map((l, i) => ({
      item_description: l.description.trim(),
      net_price: optNumber(l.netPrice),
      quantity: optNumber(l.quantity),
      unit: l.unit,
      tax_rate: optNumber(l.vatRate),
      line_net_amount: totals.lineNets[i],
    })),
    tax_basis_total: totals.net,
    tax_total: totals.vatTotal,
    grand_total: totals.gross,
    payment_terms: opt(payment.terms),
    due_date: opt(payment.dueDate),
    iban: opt(payment.iban)?.replace(/\s/g, ''),
    bic: opt(payment.bic),
  };
}

/* ---------------- Extracted invoice → form ---------------- */

type Obj = Record<string, unknown>;
const str = (v: unknown) => (v === null || v === undefined ? '' : String(v));
const obj = (v: unknown): Obj => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Obj) : {});
const arr = (v: unknown): Obj[] => (Array.isArray(v) ? v.map(obj) : []);
const decimal = (v: unknown) => (v === null || v === undefined || v === '' ? '' : String(v).replace('.', ','));

/**
 * Maps an /extract result into the form. Returns the form and whether the invoice holds data the form
 * can't show (discounts, surcharges, 0 % VAT lines, prepayments), so the UI can say so.
 */
export function invoiceToForm(invoice: Obj): { form: InvoiceForm; lossy: boolean } {
  const seller = obj(invoice.seller);
  const buyer = obj(invoice.buyer);
  const sAddr = obj(seller.address);
  const bAddr = obj(buyer.address);
  const sContact = obj(seller.contact);
  const payment = obj(invoice.payment);
  const lines = arr(invoice.lines);
  const unitFor = (code: string) => UNITS.find((u) => u.code === code || u.value === code)?.value ?? (code || 'Stk');

  const lossy =
    arr(invoice.allowances).length > 0 ||
    arr(invoice.charges).length > 0 ||
    Boolean(obj(invoice.totals).prepaid_amount) ||
    lines.some((l) => arr(l.allowances).length > 0 || arr(l.charges).length > 0 || (l.vat_category && l.vat_category !== 'S'));

  const notes = Array.isArray(invoice.notes) ? invoice.notes.map(str).filter(Boolean) : [];
  const typeCode = str(invoice.type_code) || '380';

  return {
    lossy,
    form: {
      invoiceNumber: str(invoice.invoice_number),
      issueDate: str(invoice.issue_date),
      deliveryDate: str(invoice.delivery_date),
      typeCode: TYPE_CODES.some((t) => t.value === typeCode) ? typeCode : '380',
      orderReference: str(invoice.order_reference),
      note: notes.join('\n'),
      seller: {
        name: str(seller.name),
        street: str(sAddr.street),
        postcode: str(sAddr.postcode),
        city: str(sAddr.city),
        country: str(sAddr.country) || 'DE',
        vatId: str(seller.vat_id),
        taxNumber: str(seller.tax_number),
        contactName: str(sContact.name),
        phone: str(sContact.phone),
        email: str(sContact.email) || str(seller.electronic_address),
      },
      buyer: {
        name: str(buyer.name),
        street: str(bAddr.street),
        postcode: str(bAddr.postcode),
        city: str(bAddr.city),
        country: str(bAddr.country) || 'DE',
        vatId: str(buyer.vat_id),
        email: str(buyer.electronic_address) || str(obj(buyer.contact).email),
        leitwegId: str(buyer.buyer_reference),
      },
      lines: (lines.length ? lines : [{}]).map((l) =>
        newLine({
          description: str(l.description),
          quantity: decimal(l.quantity) || '1',
          unit: unitFor(str(l.unit)),
          netPrice: decimal(l.net_price),
          vatRate: str(l.vat_rate) ? String(Number(l.vat_rate)) : '19',
        })
      ),
      payment: {
        dueDate: str(payment.due_date),
        terms: str(payment.terms),
        iban: str(payment.iban),
        bic: str(payment.bic),
        reference: str(payment.payment_reference),
        skontoDays: str(payment.discount_days),
        skontoPercent: decimal(payment.discount_percent),
      },
    },
  };
}

/* ---------------- Error field paths ---------------- */

/** Flat /convert field names → the rich model paths the form fields are keyed by. */
const FLAT_FIELDS: Record<string, string> = {
  seller_name: 'seller.name',
  seller_address: 'seller.address',
  seller_vat_id: 'seller.vat_id',
  seller_tax_number: 'seller.tax_number',
  seller_contact_name: 'seller.contact.name',
  seller_phone: 'seller.contact.phone',
  seller_email: 'seller.contact.email',
  buyer_name: 'buyer.name',
  buyer_address: 'buyer.address',
  buyer_email: 'buyer.electronic_address',
  routing_id: 'buyer.buyer_reference',
  iban: 'payment.iban',
  bic: 'payment.bic',
  due_date: 'payment.due_date',
  payment_terms: 'payment.terms',
  tax_basis_total: 'totals',
  tax_total: 'totals',
  grand_total: 'totals',
};

const RICH_ALIASES: Record<string, string> = {
  // The form sends the seller email as both contact and electronic address.
  'seller.electronic_address': 'seller.contact.email',
};

/** Normalises a backend field path (flat, rich, "invoice_data."/"body." prefixed) to a form key. */
export function normalizeFieldPath(path: string | null | undefined): string | null {
  if (!path || path.startsWith('/')) return null; // XPath from XSD/KoSIT findings
  let p = path.replace(/^(invoice_data|body)\./, '');
  const lineMatch = p.match(/^line_items\[(\d+)\]\.(\w+)$/);
  if (lineMatch) {
    const field = { item_description: 'description', tax_rate: 'vat_rate' }[lineMatch[2]] ?? lineMatch[2];
    return `lines[${lineMatch[1]}].${field}`;
  }
  p = FLAT_FIELDS[p] ?? p;
  return RICH_ALIASES[p] ?? p;
}

/** Whether an issue's normalised path points at the given form key (or a parent of it). */
export function pathMatches(issuePath: string, key: string): boolean {
  return issuePath === key || key.startsWith(`${issuePath}.`) || key.startsWith(`${issuePath}[`);
}

/* ---------------- Misc ---------------- */

export function base64ToBlob(base64: string, type: string): Blob {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type });
}

export const CHECK_LABELS: Record<string, { label: string; hint: string; labelEn: string; hintEn: string }> = {
  xml: {
    label: 'XML-Struktur',
    hint: 'Wohlgeformtheit, keine DTD oder Entities (Schutz vor XXE)',
    labelEn: 'XML structure',
    hintEn: 'Well-formed, no DTD or entities (XXE protection)',
  },
  xsd: {
    label: 'XSD-Schema',
    hint: 'Schema des erkannten Profils (Factur-X bzw. UBL 2.1)',
    labelEn: 'XSD schema',
    hintEn: 'Schema of the detected profile (Factur-X or UBL 2.1)',
  },
  business_rules: {
    label: 'Geschäftsregeln',
    hint: 'EN 16931 inkl. Nachrechnung aller Beträge, BR-DE für XRechnung',
    labelEn: 'Business rules',
    hintEn: 'EN 16931 incl. recalculation of all amounts, BR-DE for XRechnung',
  },
  kosit: {
    label: 'KoSIT-Prüfung',
    hint: 'Offizielle Schematron-Prüfung (XRechnung, EN 16931 CII)',
    labelEn: 'KoSIT check',
    hintEn: 'Official Schematron validation (XRechnung, EN 16931 CII)',
  },
  pdf: {
    label: 'PDF/A-3 & Anhang',
    hint: 'Eingebettete XML, PDF/A-3 in XMP, Profil passt zur XML',
    labelEn: 'PDF/A-3 & attachment',
    hintEn: 'Embedded XML, PDF/A-3 in XMP, profile matches the XML',
  },
};

export const ISSUE_SOURCE_LABELS: Record<string, { label: string; labelEn: string }> = {
  input: { label: 'Eingabe', labelEn: 'Input' },
  xsd: { label: 'XSD', labelEn: 'XSD' },
  'business-rules': { label: 'Geschäftsregel', labelEn: 'Business rule' },
  kosit: { label: 'KoSIT', labelEn: 'KoSIT' },
  pdf: { label: 'PDF', labelEn: 'PDF' },
  xml: { label: 'XML', labelEn: 'XML' },
};
