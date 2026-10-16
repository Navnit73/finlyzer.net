import { redirect } from 'next/navigation';
import { ANALYZERS, analyzerPath } from '@/lib/analyzers';

// No hub page while there is a single analyzer (a one-link hub is thin content);
// like /reconcile, the bare prefix sends visitors to the tool. Add a real index here
// once a second analyzer exists, then list it in the sitemap.
export default function AnalyzerIndexPage() {
  redirect(analyzerPath(ANALYZERS[0].slug));
}
