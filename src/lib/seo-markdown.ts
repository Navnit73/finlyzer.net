import fs from 'fs';
import path from 'path';
import { SEOConverterPage, SEOFeature, SEOFAQ, SEOSampleRow } from '@/types/seo';

const CONTENT_DIR = path.join(process.cwd(), 'src/content/converters');

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

      pages.push({
        slug: (data.slug as string) || file.replace(/\.md$/, ''),
        title: (data.title as string) || 'Bank Statement Converter',
        metaTitle: (data.metaTitle as string) || 'Convert Bank Statement to Excel | Finlyzer',
        metaDescription: (data.metaDescription as string) || 'Convert PDF bank statements to Excel and CSV.',
        category: (data.category as 'us-banks' | 'uk-banks' | 'india-banks' | 'tools') || 'tools',
        bankName: (data.bankName as string) || 'Bank Statement',
        country: (data.country as string) || 'Global',
        badgeText: (data.badgeText as string) || 'AI Verified Converter',
        rating: typeof data.rating === 'number' ? data.rating : 4.9,
        reviewCount: typeof data.reviewCount === 'number' ? data.reviewCount : 1250,
        keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : [],
        features: Array.isArray(data.features) ? (data.features as SEOFeature[]) : [],
        tableColumns: Array.isArray(data.tableColumns) ? (data.tableColumns as string[]) : ['Date', 'Description', 'Debit', 'Credit', 'Balance'],
        sampleData: Array.isArray(data.sampleData) ? (data.sampleData as SEOSampleRow[]) : [],
        faqs: Array.isArray(data.faqs) ? (data.faqs as SEOFAQ[]) : [],
        rawContent: content,
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
 * Returns related landing pages for cross-linking
 */
export function getRelatedLandingPages(currentSlug: string, limit = 4): SEOConverterPage[] {
  const allPages = getAllLandingPages();
  const current = allPages.find((p) => p.slug === currentSlug);
  
  return allPages
    .filter((p) => p.slug !== currentSlug)
    .sort((a, b) => {
      if (current && a.category === current.category && b.category !== current.category) return -1;
      if (current && b.category === current.category && a.category !== current.category) return 1;
      return 0;
    })
    .slice(0, limit);
}
