import { redirect } from 'next/navigation';

// The converter lives at /de/konverter/e-rechnung; keep this URL working for old links.
export default function GermanConverterPage() {
  redirect('/de/konverter/e-rechnung');
}
