import fs from 'fs';
import path from 'path';
import { SEOConverterPage, SEOFeature, SEOFAQ, SEOGuidePage, SEOSampleRow, SEOStep } from '@/types/seo';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/converters');
const GUIDES_DIR = path.join(process.cwd(), 'src/content/guides');

/**
 * Parses simple YAML-like frontmatter without bulky dependencies
 */
function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, content: raw };
  }

  const frontmatterStr = match[1];
  const content = match[2];
  const data: Record<string, unknown> = {};

  const lines = frontmatterStr.split(/\r?\n/);
  let currentKey = '';
  let currentArray: unknown[] | null = null;
  let currentObj: Record<string, unknown> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Top-level key: value
    const topKeyMatch = line.match(/^([a-zA-Z0-9_]+):\s*(.*)$/);
    if (topKeyMatch && !line.startsWith('  ')) {
      // Flush any pending array
      if (currentKey && currentArray !== null) {
        if (currentObj !== null) currentArray.push(currentObj);
        data[currentKey] = currentArray;
      }

      currentKey = topKeyMatch[1];
      const val = topKeyMatch[2].trim();

      if (val === '') {
        currentArray = [];
        currentObj = null;
      } else {
        currentArray = null;
        currentObj = null;
        data[currentKey] = cleanYamlValue(val);
      }
      continue;
    }

    // Array string item: "  - value"
    const simpleArrayMatch = line.match(/^\s*-\s+"?([^"]*)"?$/);
    if (simpleArrayMatch && currentArray !== null && currentObj === null) {
      currentArray.push(simpleArrayMatch[1]);
      continue;
    }

    // Array object start: "  - key: val"
    const arrayObjStartMatch = line.match(/^\s*-\s+([a-zA-Z0-9_]+):\s*(.*)$/);
    if (arrayObjStartMatch && currentArray !== null) {
      if (currentObj !== null) {
        currentArray.push(currentObj);
      }
      currentObj = {};
      currentObj[arrayObjStartMatch[1]] = cleanYamlValue(arrayObjStartMatch[2]);
      continue;
    }

    // Array object subfield: "    key: val"
    const objSubfieldMatch = line.match(/^\s+([a-zA-Z0-9_]+):\s*(.*)$/);
    if (objSubfieldMatch && currentObj !== null) {
      currentObj[objSubfieldMatch[1]] = cleanYamlValue(objSubfieldMatch[2]);
      continue;
    }
  }

  // Flush remaining
  if (currentKey && currentArray !== null) {
    if (currentObj !== null) currentArray.push(currentObj);
    data[currentKey] = currentArray;
  }

  return { data, content };
}

function cleanYamlValue(val: string): unknown {
  const trimmed = val.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (!isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);
  return trimmed;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
}

/**
 * Renders the small markdown subset used in converter content files.
 * Headings are shifted down one level because the page template owns the H1.
 */
export function renderMarkdown(md: string): string {
  const html: string[] = [];
  let paragraph: string[] = [];
  let list: { tag: 'ul' | 'ol'; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list) html.push(`<${list.tag}>${list.items.map((i) => `<li>${renderInline(i)}</li>`).join('')}</${list.tag}>`);
    list = null;
  };

  for (const rawLine of md.split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const ordered = line.match(/^\d+\.\s+(.*)$/);
    const unordered = line.match(/^[-*]\s+(.*)$/);

    if (!line) {
      flushParagraph();
      flushList();
    } else if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(heading[1].length + 1, 4);
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
    } else if (ordered || unordered) {
      flushParagraph();
      const tag = ordered ? 'ol' : 'ul';
      if (list && list.tag !== tag) flushList();
      if (!list) list = { tag, items: [] };
      list.items.push((ordered || unordered)![1]);
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushList();
  return html.join('\n');
}

/**
 * Returns all SEO landing pages parsed from markdown
 */
export function getAllLandingPages(): SEOConverterPage[] {
  try {
    if (!fs.existsSync(CONTENT_DIR)) {
      return [];
    }

    const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
    const pages: SEOConverterPage[] = [];

    for (const file of files) {
      const fullPath = path.join(CONTENT_DIR, file);
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = parseFrontmatter(fileContent);

      const bankName = (data.bankName as string) || 'Bank';

      pages.push({
        slug: (data.slug as string) || file.replace(/\.md$/, ''),
        title: (data.title as string) || 'Bank Statement Converter',
        metaTitle: (data.metaTitle as string) || 'Convert Bank Statement to Excel | Finlyzers',
        metaDescription: (data.metaDescription as string) || 'Convert PDF bank statements to Excel and CSV.',
        category: (data.category as SEOConverterPage['category']) || 'tools',
        bankName,
        statementLabel: (data.statementLabel as string) || `${bankName} Statement`,
        outputFormat: (data.outputFormat as string) || 'Excel',
        country: (data.country as string) || 'Global',
        badgeText: (data.badgeText as string) || 'Bank statement converter',
        intro: (data.intro as string) || (data.metaDescription as string) || '',
        keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : [],
        related: Array.isArray(data.related) ? (data.related as string[]) : [],
        features: Array.isArray(data.features) ? (data.features as SEOFeature[]) : [],
        tableColumns: Array.isArray(data.tableColumns) ? (data.tableColumns as string[]) : ['Date', 'Description', 'Debit', 'Credit', 'Balance'],
        sampleData: Array.isArray(data.sampleData) ? (data.sampleData as SEOSampleRow[]) : [],
        steps: Array.isArray(data.steps) ? (data.steps as SEOStep[]) : [],
        faqs: Array.isArray(data.faqs) ? (data.faqs as SEOFAQ[]) : [],
        acceptsSpreadsheets: data.acceptsSpreadsheets === true,
        rawContent: content,
        contentHtml: renderMarkdown(content),
      });
    }

    return pages;
  } catch (err) {
    console.error('Error loading SEO landing pages:', err);
    return [];
  }
}

/**
 * Returns a specific SEO landing page by slug
 */
export function getLandingPageBySlug(slug: string): SEOConverterPage | null {
  const allPages = getAllLandingPages();
  return allPages.find((p) => p.slug === slug) || null;
}

/**
 * Returns related landing pages for cross-linking: the page's hand-picked `related` slugs first,
 * then same-category pages to fill any remaining slots.
 */
export function getRelatedLandingPages(currentSlug: string, limit = 4): SEOConverterPage[] {
  const allPages = getAllLandingPages();
  const current = allPages.find((p) => p.slug === currentSlug);
  const others = allPages.filter((p) => p.slug !== currentSlug);

  const picked = (current?.related ?? [])
    .map((slug) => others.find((p) => p.slug === slug))
    .filter((p): p is SEOConverterPage => Boolean(p));
  const fill = others.filter((p) => !picked.includes(p) && p.category === current?.category);

  return [...picked, ...fill].slice(0, limit);
}

/**
 * Returns all guide pages parsed from src/content/guides
 */
export function getAllGuides(): SEOGuidePage[] {
  try {
    if (!fs.existsSync(GUIDES_DIR)) {
      return [];
    }

    return fs
      .readdirSync(GUIDES_DIR)
      .filter((f) => f.endsWith('.md'))
      .map((file) => {
        const { data, content } = parseFrontmatter(fs.readFileSync(path.join(GUIDES_DIR, file), 'utf8'));
        const title = (data.title as string) || 'Guide';
        return {
          slug: (data.slug as string) || file.replace(/\.md$/, ''),
          title,
          shortTitle: (data.shortTitle as string) || title,
          metaTitle: (data.metaTitle as string) || `${title} | Finlyzers`,
          metaDescription: (data.metaDescription as string) || '',
          intro: (data.intro as string) || (data.metaDescription as string) || '',
          badgeText: (data.badgeText as string) || 'Guide',
          ctaLabel: (data.ctaLabel as string) || 'Choose File',
          datePublished: String(data.datePublished || ''),
          dateModified: String(data.dateModified || data.datePublished || ''),
          acceptsSpreadsheets: data.acceptsSpreadsheets === true,
          related: Array.isArray(data.related) ? (data.related as string[]) : [],
          keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : [],
          faqs: Array.isArray(data.faqs) ? (data.faqs as SEOFAQ[]) : [],
          contentHtml: renderMarkdown(content),
        };
      });
  } catch (err) {
    console.error('Error loading guides:', err);
    return [];
  }
}

export function getGuideBySlug(slug: string): SEOGuidePage | null {
  return getAllGuides().find((g) => g.slug === slug) || null;
}
