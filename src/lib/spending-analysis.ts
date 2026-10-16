import type { ExtractionResponse, Transaction } from '@/types/ocr';

/**
 * Pure, client-safe analysis of an OCR bank-statement extraction.
 * Turns `extraction.transactions` into totals, spending categories, daily spend,
 * recurring charges and savings opportunities. No network, no storage.
 */

export type CategoryId =
  | 'income'
  | 'groceries'
  | 'dining'
  | 'shopping'
  | 'subscriptions'
  | 'utilities'
  | 'transport'
  | 'fuel'
  | 'housing'
  | 'healthcare'
  | 'travel'
  | 'entertainment'
  | 'education'
  | 'insurance'
  | 'loans'
  | 'fees'
  | 'transfers'
  | 'other';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  /** Tailwind-free CSS color token used by charts. */
  color: string;
  /** Fixed monthly obligations vs. things you control. */
  kind: 'fixed' | 'flexible';
  /** Counts toward "could cut back". */
  discretionary: boolean;
}

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  income: { id: 'income', label: 'Income', color: 'var(--color-chart-1)', kind: 'flexible', discretionary: false },
  groceries: { id: 'groceries', label: 'Groceries', color: 'var(--color-chart-1)', kind: 'flexible', discretionary: false },
  dining: { id: 'dining', label: 'Dining Out', color: 'var(--color-chart-2)', kind: 'flexible', discretionary: true },
  shopping: { id: 'shopping', label: 'Shopping', color: 'var(--color-chart-3)', kind: 'flexible', discretionary: true },
  subscriptions: { id: 'subscriptions', label: 'Subscriptions', color: 'var(--color-chart-4)', kind: 'fixed', discretionary: true },
  utilities: { id: 'utilities', label: 'Utilities', color: 'var(--color-chart-5)', kind: 'fixed', discretionary: false },
  transport: { id: 'transport', label: 'Transport', color: 'var(--color-chart-6)', kind: 'flexible', discretionary: false },
  fuel: { id: 'fuel', label: 'Fuel', color: 'var(--color-chart-7)', kind: 'flexible', discretionary: false },
  housing: { id: 'housing', label: 'Housing', color: 'var(--color-chart-8)', kind: 'fixed', discretionary: false },
  healthcare: { id: 'healthcare', label: 'Healthcare', color: 'var(--color-chart-9)', kind: 'flexible', discretionary: false },
  travel: { id: 'travel', label: 'Travel', color: 'var(--color-chart-10)', kind: 'flexible', discretionary: true },
  entertainment: { id: 'entertainment', label: 'Entertainment', color: 'var(--color-chart-4)', kind: 'flexible', discretionary: true },
  education: { id: 'education', label: 'Education', color: 'var(--color-chart-6)', kind: 'flexible', discretionary: false },
  insurance: { id: 'insurance', label: 'Insurance', color: 'var(--color-chart-8)', kind: 'fixed', discretionary: false },
  loans: { id: 'loans', label: 'Loans & EMI', color: 'var(--color-chart-8)', kind: 'fixed', discretionary: false },
  fees: { id: 'fees', label: 'Bank Fees', color: 'var(--color-chart-9)', kind: 'flexible', discretionary: true },
  transfers: { id: 'transfers', label: 'Transfers', color: 'var(--color-chart-10)', kind: 'flexible', discretionary: false },
  other: { id: 'other', label: 'Other', color: 'var(--color-chart-other)', kind: 'flexible', discretionary: false },
};

/** Order matters: first match wins. */
const KEYWORD_RULES: [CategoryId, RegExp][] = [
  ['subscriptions', /netflix|spotify|hotstar|prime video|amazon prime|youtube (premium|music)|apple\.com\/bill|itunes|icloud|google (one|storage)|disney|hulu|hbo|audible|dropbox|adobe|microsoft 365|office 365|chatgpt|openai|notion|zoom\.us|linkedin prem|subscription|membership/i],
  ['fees', /service charge|bank charge|annual fee|late fee|overdraft|atm fee|sms charge|maintenance charge|min(imum)? bal|gst on|penalty|processing fee|interest charged|finance charge/i],
  ['insurance', /insurance|\blic\b|geico|allstate|policy premium|star health|hdfc ergo|icici lombard/i],
  ['loans', /\bemi\b|loan|mortgage|credit card payment|card payment|bajaj fin|installment/i],
  ['housing', /\brent\b|landlord|property tax|maintenance|society|housing|hoa\b|nobroker/i],
  ['utilities', /electric|power|water|gas bill|internet|broadband|wifi|verizon|at&t|t-mobile|comcast|spectrum|airtel|jio|vodafone|vi prepaid|bsnl|recharge|utility|bescom|tata power|dth|tata play/i],
  ['groceries', /grocer|supermarket|walmart|kroger|publix|costco|aldi|safeway|whole foods|trader joe|target\b|bigbasket|blinkit|zepto|dmart|d-mart|reliance fresh|reliance smart|instamart|more retail|spar\b|lidl|tesco|sainsbury/i],
  ['dining', /restaurant|cafe|coffee|starbucks|mcdonald|burger|pizza|domino|kfc|subway|swiggy|zomato|doordash|uber ?eats|grubhub|chipotle|dunkin|bar &|pub\b|dine|food|bakery|eats/i],
  ['fuel', /\bfuel\b|petrol|diesel|shell\b|chevron|exxon|bp\b|bharat petroleum|hpcl|indian oil|iocl|gas station|speedway|7-eleven/i],
  ['transport', /uber|lyft|ola\b|rapido|metro|railway|irctc|transit|parking|toll|fastag|cab\b|taxi|bus\b|redbus/i],
  ['travel', /airline|airways|air india|indigo|spicejet|delta|united air|southwest|flight|hotel|airbnb|booking\.com|makemytrip|goibibo|expedia|trip\.com|resort|cleartrip/i],
  ['healthcare', /pharm|hospital|clinic|medical|doctor|dental|apollo|cvs|walgreens|1mg|netmeds|lab\b|diagnostic|health/i],
  ['education', /school|college|university|tuition|course|udemy|coursera|byju|unacademy|exam fee/i],
  ['entertainment', /movie|cinema|pvr|inox|bookmyshow|steam|playstation|xbox|nintendo|concert|ticketmaster|gaming|theatre|theater/i],
  ['shopping', /amazon|flipkart|myntra|ajio|nykaa|ebay|etsy|apple store|best buy|nike|adidas|zara|h&m|ikea|meesho|shop|store|mall|retail|pos debit|purchase/i],
  ['transfers', /transfer|neft|rtgs|imps|upi|zelle|venmo|paypal|cash app|wire|withdrawal|atm|self/i],
];

/** Map a free-form category label coming back from the OCR service onto ours. */
function fromOcrCategory(label: string | null | undefined): CategoryId | null {
  if (!label) return null;
  const l = label.toLowerCase().trim();
  if (!l || l === 'other' || l === 'uncategorized' || l === 'misc') return null;
  for (const [id, re] of KEYWORD_RULES) {
    if (re.test(l)) return id;
  }
  const direct = (Object.keys(CATEGORIES) as CategoryId[]).find(
    (id) => CATEGORIES[id].label.toLowerCase() === l || id === l
  );
  return direct ?? null;
}

export function categorize(tx: Pick<Transaction, 'description' | 'category'>, isCredit: boolean): CategoryId {
  if (isCredit) return 'income';
  const fromDesc = KEYWORD_RULES.find(([, re]) => re.test(tx.description || ''));
  // Description keywords are more specific than the generic bucket the OCR model returns,
  // except the catch-all rules ('shopping' via "pos debit", 'transfers') which the OCR label may beat.
  const ocr = fromOcrCategory(tx.category);
  if (fromDesc && fromDesc[0] !== 'shopping' && fromDesc[0] !== 'transfers') return fromDesc[0];
  return ocr ?? fromDesc?.[0] ?? 'other';
}

/** "POS DEBIT NETFLIX.COM 12345" → "Netflix.com". */
export function cleanMerchant(description: string): string {
  let s = (description || '').trim();
  s = s
    .replace(/^(pos|ach|upi|neft|imps|rtgs|ecs|nach|debit card|credit card|card|dr|cr)\b[\s/:*-]*(debit|credit|purchase|payment|withdrawal|txn)?[\s/:*-]*/i, '')
    .replace(/^(upi|imps|neft)[/\-\s]+(\d+[/\-\s]+)?/i, '')
    .replace(/[#*]\s*\d+\b/g, ' ')
    .replace(/\b\d{5,}\b/g, ' ')
    .replace(/\b(ref|txn|utr)\s*(no|id)?[:.\s-]*\w+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) s = (description || 'Unknown').trim();
  const first = s.split(/\s{2,}|\s[-/]\s/)[0].slice(0, 34).trim();
  return first
    .toLowerCase()
    .replace(/(^|[\s.*/])([a-z])/g, (_, p: string, c: string) => p + c.toUpperCase());
}

export interface ParsedTransaction {
  id: number;
  /** ISO yyyy-mm-dd, or null when the date could not be read. */
  date: string | null;
  rawDate: string;
  description: string;
  merchant: string;
  /** Positive number. */
  amount: number;
  direction: 'in' | 'out';
  category: CategoryId;
  recurring: boolean;
}

export interface CategoryTotal {
  id: CategoryId;
  label: string;
  color: string;
  total: number;
  share: number;
  count: number;
}

export interface DayTotal {
  date: string;
  total: number;
  byCategory: { id: CategoryId; label: string; color: string; amount: number }[];
}

export interface MerchantTotal {
  merchant: string;
  total: number;
  count: number;
  category: CategoryId;
}

export interface RecurringCharge {
  merchant: string;
  category: CategoryId;
  amount: number;
  count: number;
  total: number;
  cadence: 'monthly' | 'recurring';
}

export interface SpendingAnalysis {
  currency: string;
  periodLabel: string;
  bankName: string | null;
  transactions: ParsedTransaction[];
  totalIn: number;
  totalOut: number;
  kept: number;
  /** Savings as a fraction of income, null when there is no income. */
  savingsRate: number | null;
  /** Outflow categories, largest first. */
  categories: CategoryTotal[];
  days: DayTotal[];
  biggestDay: DayTotal | null;
  topMerchants: MerchantTotal[];
  recurring: RecurringCharge[];
  recurringTotal: number;
  /** Discretionary spend: the "you could cut back" figure. */
  cuttable: number;
  cuttableCategories: CategoryTotal[];
  fixedTotal: number;
  flexibleTotal: number;
  incomeSources: MerchantTotal[];
  largestExpense: ParsedTransaction | null;
  averageDailySpend: number;
  skippedRows: number;
}

// ---------- dates ----------

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function validIso(y: number, m: number, d: number): string | null {
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

function fullYear(y: number): number {
  return y < 100 ? (y > 70 ? 1900 + y : 2000 + y) : y;
}

type Order = 'dmy' | 'mdy';

/** Decide day-first vs month-first once for the whole statement. */
function detectOrder(rawDates: string[]): Order {
  let dayFirst = 0;
  let monthFirst = 0;
  for (const raw of rawDates) {
    const m = raw.trim().match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/);
    if (!m) continue;
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (a > 12 && b <= 12) dayFirst++;
    else if (b > 12 && a <= 12) monthFirst++;
  }
  // Ambiguous statements default to day-first (most of the world, and Indian statements).
  return monthFirst > dayFirst ? 'mdy' : 'dmy';
}

export function parseDate(raw: string | null | undefined, order: Order = 'dmy'): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;

  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return validIso(Number(m[1]), Number(m[2]), Number(m[3]));

  m = s.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})/);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const y = fullYear(Number(m[3]));
    if (a > 12) return validIso(y, b, a);
    if (b > 12) return validIso(y, a, b);
    return order === 'dmy' ? validIso(y, b, a) : validIso(y, a, b);
  }

  // 05 Jan 2025 · 05-Jan-25 · 5 January, 2025
  m = s.match(/^(\d{1,2})[\s\-/.]*([A-Za-z]{3,9})[\s\-/.,]*(\d{2,4})/);
  if (m) {
    const mi = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase());
    if (mi >= 0) return validIso(fullYear(Number(m[3])), mi + 1, Number(m[1]));
  }

  // Jan 5, 2025
  m = s.match(/^([A-Za-z]{3,9})[\s\-/.]*(\d{1,2})(?:st|nd|rd|th)?[\s\-/.,]*(\d{2,4})/);
  if (m) {
    const mi = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
    if (mi >= 0) return validIso(fullYear(Number(m[3])), mi + 1, Number(m[2]));
  }

  return null;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function periodLabel(dates: string[], fallback: string | null | undefined): string {
  if (dates.length === 0) return fallback?.trim() || 'Your statement';
  const sorted = [...dates].sort();
  const [y1, m1] = sorted[0].split('-').map(Number);
  const [y2, m2] = sorted[sorted.length - 1].split('-').map(Number);
  if (y1 === y2 && m1 === m2) return `${MONTH_NAMES[m1 - 1]} ${y1}`;
  if (y1 === y2) return `${MONTH_NAMES[m1 - 1]}–${MONTH_NAMES[m2 - 1]} ${y1}`;
  return `${MONTH_NAMES[m1 - 1]} ${y1} – ${MONTH_NAMES[m2 - 1]} ${y2}`;
}

// ---------- formatting ----------

const CURRENCY_ALIASES: Record<string, string> = { '₹': 'INR', RS: 'INR', 'RS.': 'INR', '$': 'USD', '€': 'EUR', '£': 'GBP' };

export function normalizeCurrency(code: string | null | undefined): string {
  const c = (code || '').trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(c)) return c;
  return CURRENCY_ALIASES[c] || (code ? CURRENCY_ALIASES[code.trim()] : '') || 'USD';
}

export function formatMoney(value: number, currency: string, opts: { cents?: boolean; compact?: boolean } = {}): string {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      notation: opts.compact ? 'compact' : 'standard',
      minimumFractionDigits: opts.cents ? 2 : 0,
      maximumFractionDigits: opts.cents ? 2 : opts.compact ? 1 : 0,
    }).format(value);
  } catch {
    return `${currency} ${Math.round(value).toLocaleString()}`;
  }
}

export function formatShortDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1][0].toUpperCase()}${MONTHS[m - 1].slice(1)} ${d}`;
}

// ---------- analysis ----------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function sumBy<T>(items: T[], pick: (item: T) => number): number {
  return items.reduce((acc, item) => acc + pick(item), 0);
}

export function analyzeStatement(response: Pick<ExtractionResponse, 'extraction'>): SpendingAnalysis {
  const extraction = response.extraction || {};
  const rows: Transaction[] = Array.isArray(extraction.transactions) ? extraction.transactions : [];
  const currency = normalizeCurrency(extraction.currency);
  const order = detectOrder(rows.map((r) => r.date || ''));

  let skipped = 0;
  const parsed: ParsedTransaction[] = [];
  rows.forEach((row, index) => {
    const debit = Number(row.debit) || 0;
    const credit = Number(row.credit) || 0;
    const net = credit - debit;
    if (!net) {
      skipped++;
      return;
    }
    const isCredit = net > 0;
    const description = (row.description || '').trim() || 'Unknown';
    parsed.push({
      id: index,
      date: parseDate(row.date, order),
      rawDate: row.date || '',
      description,
      merchant: cleanMerchant(description),
      amount: round2(Math.abs(net)),
      direction: isCredit ? 'in' : 'out',
      category: categorize({ description, category: row.category }, isCredit),
      recurring: false,
    });
  });

  // Recurring charges: same merchant, 2+ different months (or 3+ charges), similar amounts — or a known subscription.
  const outByMerchant = new Map<string, ParsedTransaction[]>();
  for (const tx of parsed) {
    if (tx.direction !== 'out') continue;
    const list = outByMerchant.get(tx.merchant) ?? [];
    list.push(tx);
    outByMerchant.set(tx.merchant, list);
  }
  const recurring: RecurringCharge[] = [];
  for (const [merchant, list] of outByMerchant) {
    const typical = median(list.map((t) => t.amount));
    const similar = list.filter((t) => Math.abs(t.amount - typical) <= typical * 0.15);
    const months = new Set(similar.map((t) => t.date?.slice(0, 7)).filter(Boolean));
    const category = list[0].category;
    const monthly = months.size >= 2 && similar.length >= 2;
    // Known subscriptions always count; bills count when they repeat in 2+ months.
    // Everyday spend (groceries, dining, fuel, ...) repeating is habit, not a recurring charge.
    const qualifies = category === 'subscriptions' || (monthly && isBillCategory(category));
    if (!qualifies) continue;
    for (const t of list) t.recurring = true;
    recurring.push({
      merchant,
      category: list[0].category,
      amount: round2(typical),
      count: list.length,
      total: round2(sumBy(list, (t) => t.amount)),
      cadence: months.size >= 2 ? 'monthly' : 'recurring',
    });
  }
  recurring.sort((a, b) => b.total - a.total);

  const outgoing = parsed.filter((t) => t.direction === 'out');
  const incoming = parsed.filter((t) => t.direction === 'in');
  const totalOut = round2(sumBy(outgoing, (t) => t.amount));
  const totalIn = round2(sumBy(incoming, (t) => t.amount));

  // Categories (outflow only)
  const catMap = new Map<CategoryId, { total: number; count: number }>();
  for (const t of outgoing) {
    const cur = catMap.get(t.category) ?? { total: 0, count: 0 };
    cur.total += t.amount;
    cur.count += 1;
    catMap.set(t.category, cur);
  }
  const categories: CategoryTotal[] = [...catMap.entries()]
    .map(([id, v]) => ({
      id,
      label: CATEGORIES[id].label,
      color: CATEGORIES[id].color,
      total: round2(v.total),
      share: totalOut > 0 ? v.total / totalOut : 0,
      count: v.count,
    }))
    .sort((a, b) => b.total - a.total);

  // Daily spend
  const dayMap = new Map<string, Map<CategoryId, number>>();
  for (const t of outgoing) {
    if (!t.date) continue;
    const m = dayMap.get(t.date) ?? new Map<CategoryId, number>();
    m.set(t.category, (m.get(t.category) ?? 0) + t.amount);
    dayMap.set(t.date, m);
  }
  const days: DayTotal[] = [...dayMap.entries()]
    .map(([date, m]) => {
      const byCategory = [...m.entries()]
        .map(([id, amount]) => ({ id, label: CATEGORIES[id].label, color: CATEGORIES[id].color, amount: round2(amount) }))
        .sort((a, b) => b.amount - a.amount);
      return { date, total: round2(sumBy(byCategory, (c) => c.amount)), byCategory };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
  const biggestDay = days.reduce<DayTotal | null>((best, d) => (!best || d.total > best.total ? d : best), null);

  // Merchants
  const merchantMap = (list: ParsedTransaction[]) => {
    const map = new Map<string, MerchantTotal>();
    for (const t of list) {
      const cur = map.get(t.merchant) ?? { merchant: t.merchant, total: 0, count: 0, category: t.category };
      cur.total += t.amount;
      cur.count += 1;
      map.set(t.merchant, cur);
    }
    return [...map.values()].map((m) => ({ ...m, total: round2(m.total) })).sort((a, b) => b.total - a.total);
  };

  const cuttableCategories = categories.filter((c) => CATEGORIES[c.id].discretionary);
  const cuttable = round2(sumBy(cuttableCategories, (c) => c.total));
  const fixedTotal = round2(sumBy(categories.filter((c) => CATEGORIES[c.id].kind === 'fixed'), (c) => c.total));

  const dated = parsed.map((t) => t.date).filter((d): d is string => Boolean(d));
  const spanDays = dated.length ? Math.max(1, Math.round((Date.parse([...dated].sort().pop()!) - Date.parse([...dated].sort()[0])) / 86_400_000) + 1) : 0;

  return {
    currency,
    periodLabel: periodLabel(dated, extraction.statement_period),
    bankName: extraction.bank_name ?? null,
    transactions: parsed,
    totalIn,
    totalOut,
    kept: round2(totalIn - totalOut),
    savingsRate: totalIn > 0 ? (totalIn - totalOut) / totalIn : null,
    categories,
    days,
    biggestDay,
    topMerchants: merchantMap(outgoing).slice(0, 8),
    recurring,
    recurringTotal: round2(sumBy(recurring, (r) => r.total)),
    cuttable,
    cuttableCategories,
    fixedTotal,
    flexibleTotal: round2(totalOut - fixedTotal),
    incomeSources: merchantMap(incoming).slice(0, 8),
    largestExpense: outgoing.reduce<ParsedTransaction | null>((best, t) => (!best || t.amount > best.amount ? t : best), null),
    averageDailySpend: spanDays ? round2(totalOut / spanDays) : 0,
    skippedRows: skipped,
  };
}

/** Bills that repeat monthly (rent, EMI, insurance, utilities) count as recurring charges. */
function isBillCategory(category: CategoryId): boolean {
  return ['housing', 'loans', 'insurance', 'utilities', 'education', 'fees', 'healthcare', 'entertainment', 'other'].includes(category);
}
