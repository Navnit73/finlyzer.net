/**
 * SEO and wiring checks for /calculators pages, run with the calculation tests (`npm run test:calc`).
 * Reads the markdown, the registry and the sitemap as text so it runs under plain `node --test`.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const CALC_DIR = path.join(ROOT, 'src/content/calculators');
const CONTENT_DIRS = ['calculators', 'converters', 'guides', 'reconciliation', 'analyzers'].map((d) => path.join(ROOT, 'src/content', d));
const SITE = 'https://finlyzers.com';

interface Page {
  file: string;
  slug: string;
  front: string;
  body: string;
}

function readPages(dir: string): Page[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      assert.ok(m, `${file}: missing frontmatter`);
      const slug = scalar(m[1], 'slug') || file.replace(/\.md$/, '');
      return { file, slug, front: m[1], body: m[2] };
    });
}

function scalar(front: string, key: string): string {
  const m = front.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, 'm'));
  return m ? m[1] : '';
}

function list(front: string, key: string): string[] {
  const m = front.match(new RegExp(`^${key}:\\s*\\n((?:\\s+-\\s+.*\\n?)+)`, 'm'));
  if (!m) return [];
  return m[1]
    .split('\n')
    .map((l) => l.match(/^\s+-\s+"?([^"]*)"?\s*$/)?.[1])
    .filter((v): v is string => Boolean(v));
}

const calcPages = readPages(CALC_DIR);
const registry = fs.readFileSync(path.join(ROOT, 'src/components/calculators/registry.ts'), 'utf8');
const registered = new Set([...registry.matchAll(/^\s+'([a-z0-9-]+)',$/gm)].map((m) => m[1]));
const loader = fs.readFileSync(path.join(ROOT, 'src/components/calculators/CalculatorLoader.tsx'), 'utf8');
const loaded = new Set([...loader.matchAll(/^\s+'([a-z0-9-]+)': dynamic\(/gm)].map((m) => m[1]));
const sitemap = fs.readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8');

test('every calculator page has a registered tool and every tool has a page', () => {
  const slugs = new Set(calcPages.map((p) => p.slug));
  for (const p of calcPages) assert.ok(registered.has(p.slug), `${p.file}: not in CALCULATORS registry`);
  for (const s of registered) assert.ok(slugs.has(s), `registry entry ${s} has no markdown page`);
  assert.ok(registered.size > 0, 'registry parsed as empty');
  assert.deepEqual([...loaded].sort(), [...registered].sort(), 'CalculatorLoader and CALCULATOR_SLUGS differ');
});

test('slugs match file names and are lowercase kebab-case', () => {
  for (const p of calcPages) {
    assert.equal(p.slug, p.file.replace(/\.md$/, ''), `${p.file}: slug differs from file name`);
    assert.match(p.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  }
});

test('required frontmatter is present', () => {
  for (const p of calcPages) {
    for (const key of ['title', 'shortTitle', 'metaTitle', 'metaDescription', 'intro', 'category', 'group', 'market', 'summary', 'ctaLabel', 'datePublished']) {
      assert.ok(scalar(p.front, key), `${p.file}: missing ${key}`);
    }
    assert.ok(['personal', 'business'].includes(scalar(p.front, 'category')), `${p.file}: bad category`);
    assert.ok(list(p.front, 'keywords').length > 0, `${p.file}: no keywords`);
    assert.ok(list(p.front, 'faqs').length === 0, `${p.file}: faqs parsed as a plain list`);
  }
});

test('titles and descriptions are unique and within SERP length', () => {
  const titles = new Map<string, string>();
  const descriptions = new Map<string, string>();
  for (const p of calcPages) {
    const t = scalar(p.front, 'metaTitle');
    const d = scalar(p.front, 'metaDescription');
    assert.ok(!titles.has(t), `${p.file}: metaTitle duplicates ${titles.get(t)}`);
    assert.ok(!descriptions.has(d), `${p.file}: metaDescription duplicates ${descriptions.get(d)}`);
    titles.set(t, p.file);
    descriptions.set(d, p.file);
    assert.ok(t.length <= 65, `${p.file}: metaTitle is ${t.length} chars`);
    assert.ok(d.length >= 70 && d.length <= 165, `${p.file}: metaDescription is ${d.length} chars`);
  }
});

test('one H1 per page: the template owns it, markdown starts at #', () => {
  // renderMarkdown shifts headings down a level, so "#" in content becomes <h2>. The page title is the only H1.
  for (const p of calcPages) assert.ok(!/<h1[\s>]/i.test(p.body), `${p.file}: raw <h1> in markdown body`);
});

test('no primary keyword is owned by two pages anywhere on the site', () => {
  const owner = new Map<string, string>();
  for (const dir of CONTENT_DIRS) {
    for (const p of readPages(dir)) {
      const primary = list(p.front, 'keywords')[0]?.toLowerCase();
      if (!primary) continue;
      assert.ok(!owner.has(primary), `"${primary}" is primary for both ${owner.get(primary)} and ${p.file}`);
      owner.set(primary, p.file);
    }
  }
  // Any keyword listed on a calculator page must not appear on another calculator page.
  const seen = new Map<string, string>();
  for (const p of calcPages) {
    for (const k of list(p.front, 'keywords').map((k) => k.toLowerCase())) {
      assert.ok(!seen.has(k), `keyword "${k}" listed on ${seen.get(k)} and ${p.file}`);
      seen.set(k, p.file);
    }
  }
});

test('related slugs point at calculator pages (planned pages are allowed but not self-links)', () => {
  const planned = fs.readFileSync(path.join(ROOT, 'docs/finance-tools/TOOL_INVENTORY.md'), 'utf8');
  for (const p of calcPages) {
    for (const r of list(p.front, 'related')) {
      assert.notEqual(r, p.slug, `${p.file}: links to itself`);
      assert.ok(calcPages.some((c) => c.slug === r) || planned.includes(`/calculators/${r}\``), `${p.file}: related "${r}" is not a known calculator`);
    }
  }
});

test('internal links in the body point at real routes', () => {
  const known = new Set<string>(['/calculators', '/pricing', '/']);
  for (const dir of CONTENT_DIRS) {
    const prefix = { calculators: '/calculators/', converters: '/convert/', guides: '/guides/', reconciliation: '/reconcile/', analyzers: '/analyzer/' }[path.basename(dir)]!;
    for (const p of readPages(dir)) known.add(prefix + p.slug);
  }
  for (const p of calcPages) {
    for (const m of p.body.matchAll(/\]\((\/[^)\s#]*)/g)) assert.ok(known.has(m[1]), `${p.file}: broken link ${m[1]}`);
  }
});

test('every live calculator and the hub are in the sitemap', () => {
  assert.ok(sitemap.includes(`<loc>${SITE}/calculators</loc>`), 'hub missing from sitemap');
  for (const p of calcPages) assert.ok(sitemap.includes(`<loc>${SITE}/calculators/${p.slug}</loc>`), `${p.slug} missing from sitemap`);
  assert.ok(!sitemap.includes('<lastmod>'), 'owner decision: no <lastmod> in the sitemap');
});
