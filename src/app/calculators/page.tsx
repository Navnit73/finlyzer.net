import { redirect } from 'next/navigation';

// No hub page while there is a single calculator (a one-link hub is thin content);
// like /analyzer, the bare prefix sends visitors to the tool. Add a real index here
// once a second calculator exists, then list it in the sitemap.
export default function CalculatorsIndexPage() {
  redirect('/calculators/cash-flow-calculator');
}
