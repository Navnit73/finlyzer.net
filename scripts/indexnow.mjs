// Submits every URL in public/sitemap.xml to IndexNow (Bing, Yandex, Seznam, Naver, ...).
// Run after deploying, so the key file is live: npm run indexnow [-- url1 url2 ...]
import { readFileSync } from 'node:fs';

const KEY = '8d596ea79a404c958e2c877a47373547';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://finlyzers.com').replace(/\/$/, '');
const host = new URL(SITE_URL).host;

const cliUrls = process.argv.slice(2);
const urlList = cliUrls.length
  ? cliUrls
  : [...readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList }),
});

console.log(`IndexNow: ${res.status} ${res.statusText} (${urlList.length} URLs)`);
if (!res.ok) {
  console.error(await res.text());
  process.exit(1);
}
