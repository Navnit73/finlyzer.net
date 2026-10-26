import fs from 'fs';
import path from 'path';
import { SEORatgeberPage, RatgeberTocItem, RatgeberMainCta } from '@/types/ratgeber';
import { SEOFAQ } from '@/types/seo';

const RATGEBER_DIR = path.join(process.cwd(), 'src/content/ratgeber');

/**
 * Creates URL-safe anchor slug from heading text, handling German umlauts.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Parses simple YAML-like frontmatter without external dependencies.
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

    // Top-level object subfield: "  key: val" (e.g. mainCta:)
    const topObjSubfieldMatch = line.match(/^  ([a-zA-Z0-9_]+):\s*(.*)$/);
    if (topObjSubfieldMatch && currentKey && currentArray === null) {
      if (typeof data[currentKey] !== 'object' || data[currentKey] === null) {
        data[currentKey] = {};
      }
      (data[currentKey] as Record<string, unknown>)[topObjSubfieldMatch[1]] = cleanYamlValue(topObjSubfieldMatch[2]);
      continue;
    }
  }

  // Flush remaining array
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
    .replace(/`([^`]+)`/g, '<code class="font-mono text-[0.88em] px-1.5 py-0.5 rounded-md bg-[var(--color-surface-muted)] text-[var(--color-ink)]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-[var(--color-ink)]">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" class="text-[var(--color-brand-dark)] hover:underline underline-offset-[3px] transition-colors">$1</a>');
}

/**
 * Calculates estimated reading time from markdown text.
 */
export function calculateReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 190));
  return `${minutes} Min. Lesezeit`;
}

/**
 * Renders Ratgeber markdown into clean, accessible HTML and extracts the table of contents.
 */
export function renderRatgeberMarkdown(md: string): { html: string; toc: RatgeberTocItem[] } {
  const html: string[] = [];
  const toc: RatgeberTocItem[] = [];
  let paragraph: string[] = [];
  let list: { tag: 'ul' | 'ol'; items: string[] } | null = null;
  let quote: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p class="leading-relaxed text-[var(--color-text-secondary)]">${renderInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list) {
      const listClass = list.tag === 'ol' ? 'list-decimal pl-6 space-y-2 text-[var(--color-text-secondary)]' : 'list-disc pl-6 space-y-2 text-[var(--color-text-secondary)]';
      html.push(`<${list.tag} class="${listClass}">${list.items.map((i) => `<li class="marker:text-[var(--color-text-muted)]">${renderInline(i)}</li>`).join('')}</${list.tag}>`);
      list = null;
    }
  };

  const flushQuote = () => {
    if (quote.length) {
      const fullQuote = quote.join(' ');
      const isTip = fullQuote.startsWith('[!TIP]') || fullQuote.toLowerCase().includes('tipp:');
      const isImportant = fullQuote.startsWith('[!IMPORTANT]') || fullQuote.toLowerCase().includes('wichtig:');
      const cleanText = fullQuote
        .replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '')
        .trim();

      const borderClass = isImportant
        ? 'border-l-4 border-[var(--color-warning)] bg-[var(--color-warning-soft)]'
        : isTip
        ? 'border-l-4 border-[var(--color-success)] bg-[var(--color-success-soft)]'
        : 'border-l-4 border-[var(--color-brand)] bg-[var(--color-brand-soft)]';

      html.push(
        `<div class="my-6 p-4 sm:p-5 rounded-r-2xl ${borderClass}">` +
          `<div class="text-[15px] sm:text-[16px] leading-relaxed text-[var(--color-ink)]">${renderInline(cleanText)}</div>` +
        `</div>`
      );
      quote = [];
    }
  };

  let table: string[] = [];
  const flushTable = () => {
    if (!table.length) return;
    const cells = (row: string) => row.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    const isDivider = (row: string) => /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(row);
    if (table.length >= 2 && isDivider(table[1])) {
      const align = cells(table[1]).map((c) => (c.endsWith(':') ? (c.startsWith(':') ? 'center' : 'right') : ''));
      const cell = (tag: 'th' | 'td', text: string, i: number) =>
        `<${tag}${align[i] ? ` style="text-align:${align[i]}"` : ''}>${renderInline(text)}</${tag}>`;
      const head = `<tr>${cells(table[0]).map((c, i) => cell('th', c, i)).join('')}</tr>`;
      const body = table
        .slice(2)
        .map((row) => `<tr>${cells(row).map((c, i) => cell('td', c, i)).join('')}</tr>`)
        .join('');
      html.push(`<div class="md-table my-6"><table><thead>${head}</thead><tbody>${body}</tbody></table></div>`);
    } else {
      paragraph.push(...table);
    }
    table = [];
  };

  for (const rawLine of md.split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    const ordered = line.match(/^\d+\.\s+(.*)$/);
    const unordered = line.match(/^[-*]\s+(.*)$/);
    const blockquote = line.match(/^>\s*(.*)$/);

    if (line.startsWith('|')) {
      flushParagraph();
      flushList();
      flushQuote();
      table.push(line);
      continue;
    }
    flushTable();

    if (blockquote) {
      flushParagraph();
      flushList();
      quote.push(blockquote[1]);
      continue;
    }
    flushQuote();

    if (!line) {
      flushParagraph();
      flushList();
    } else if (heading) {
      flushParagraph();
      flushList();

      const hashCount = heading[1].length;
      // Headings: ## -> h2, ### -> h3, #### -> h4. If single # is used, treat as h2.
      const level = hashCount === 1 ? 2 : hashCount;
      const titleText = heading[2].trim();
      const id = slugifyHeading(titleText);

      if (level === 2 || level === 3) {
        toc.push({ id, text: titleText, level });
      }

      let headingClasses = '';
      if (level === 2) {
        headingClasses = 'type-title !text-[24px] sm:!text-[30px] font-semibold text-[var(--color-ink)] pt-10 sm:pt-14 pb-1 scroll-mt-24 border-b border-[var(--color-border)]';
      } else if (level === 3) {
        headingClasses = 'type-headline !text-[19px] sm:!text-[22px] font-semibold text-[var(--color-ink)] pt-6 sm:pt-8 pb-1 scroll-mt-24';
      } else {
        headingClasses = 'text-[16px] sm:text-[18px] font-semibold text-[var(--color-ink)] pt-4 pb-1 scroll-mt-24';
      }

      html.push(`<h${level} id="${id}" class="${headingClasses}">${renderInline(titleText)}</h${level}>`);
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

  flushTable();
  flushQuote();
  flushParagraph();
  flushList();

  return { html: html.join('\n'), toc };
}

/**
 * Returns all Ratgeber guide pages parsed from src/content/ratgeber/*.md
 */
export function getAllRatgeberPages(): SEORatgeberPage[] {
  try {
    if (!fs.existsSync(RATGEBER_DIR)) {
      return [];
    }

    const files = fs.readdirSync(RATGEBER_DIR).filter((f) => f.endsWith('.md'));
    const pages: SEORatgeberPage[] = [];

    for (const file of files) {
      const fullPath = path.join(RATGEBER_DIR, file);
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = parseFrontmatter(fileContent);

      const title = (data.title as string) || 'Ratgeber';
      const shortTitle = (data.shortTitle as string) || title;
      const metaTitle = (data.metaTitle as string) || `${title} | Finlyzers`;
      const metaDescription = (data.metaDescription as string) || '';
      const intro = (data.intro as string) || metaDescription;
      const badgeText = (data.badgeText as string) || 'Ratgeber';
      const datePublished = String(data.datePublished || '2026-10-26');
      const dateModified = String(data.dateModified || data.datePublished || '2026-10-26');
      const readingTime = (data.readingTime as string) || calculateReadingTime(content);
      const author = (data.author as string) || 'Finlyzers Redaktion';

      const mainCtaData = (data.mainCta as Record<string, string>) || {};
      const mainCta: RatgeberMainCta = {
        label: mainCtaData.label || 'ZUGFeRD-Rechnung jetzt erstellen',
        href: mainCtaData.href || '/de/konverter/e-rechnung',
        title: mainCtaData.title || mainCtaData.label || 'ZUGFeRD-Rechnung jetzt erstellen',
        description:
          mainCtaData.description ||
          'Wandeln Sie Ihre PDF-Rechnung in Sekunden in eine rechtskonforme ZUGFeRD-Datei um. Kostenlos und ohne Registrierung.',
      };

      const keywords = Array.isArray(data.keywords) ? (data.keywords as string[]) : [];
      const related = Array.isArray(data.related) ? (data.related as string[]) : [];
      const faqs = Array.isArray(data.faqs) ? (data.faqs as SEOFAQ[]) : [];

      const { html: contentHtml, toc } = renderRatgeberMarkdown(content);

      pages.push({
        slug: (data.slug as string) || file.replace(/\.md$/, ''),
        title,
        shortTitle,
        metaTitle,
        metaDescription,
        intro,
        badgeText,
        datePublished,
        dateModified,
        readingTime,
        author,
        mainCta,
        keywords,
        related,
        faqs,
        toc,
        contentHtml,
        rawContent: content,
      });
    }

    // Sort by dateModified descending
    return pages.sort((a, b) => (b.dateModified || '').localeCompare(a.dateModified || ''));
  } catch (err) {
    console.error('Error loading Ratgeber pages:', err);
    return [];
  }
}

/**
 * Returns a single Ratgeber page by slug
 */
export function getRatgeberPageBySlug(slug: string): SEORatgeberPage | null {
  const allPages = getAllRatgeberPages();
  return allPages.find((p) => p.slug === slug) || null;
}

/**
 * Returns all Ratgeber slugs for generateStaticParams
 */
export function getAllRatgeberSlugs(): string[] {
  return getAllRatgeberPages().map((p) => p.slug);
}
