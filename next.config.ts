import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // The English site (src/app/(site)) and /de (src/app/de) are separate root layouts, so
    // unmatched URLs need src/app/global-not-found.tsx.
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // Generated share images inside the (site) route group get a hash suffix from Next.js
  // (e.g. /convert/x/opengraph-image-qllqjw/card). These rewrites keep the URLs they had before the
  // English routes moved into (site), so cached social previews still load. The suffix is a hash
  // of the segment path: if one of these folders moves, rebuild and update its suffix here.
  async rewrites() {
    const suffixes: [string, string][] = [
      ['/convert/:slug', 'qllqjw'],
      ['/calculators/:slug', 'n9lodk'],
      ['/reconcile/:slug', '138j9a'],
      ['/analyzer/:slug', 'z3gdt'],
    ];
    return suffixes.flatMap(([base, hash]) =>
      ['opengraph-image', 'twitter-image'].flatMap((image) => [
        { source: `${base}/${image}`, destination: `${base}/${image}-${hash}` },
        { source: `${base}/${image}/:id`, destination: `${base}/${image}-${hash}/:id` },
      ]),
    );
  },
  async redirects() {
    return [
      // One canonical host: nginx serves both finlyzers.com and www, so send www to the apex.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.finlyzers.com' }],
        destination: 'https://finlyzers.com/:path*',
        permanent: true,
      },
      // /reconcile has no hub page; send it to the main reconciliation tool.
      {
        source: '/reconcile',
        destination: '/reconcile/bank-reconciliation-tool',
        permanent: false,
      },
      // Bank converter slugs renamed to the "<bank>-...-statement-to-excel" pattern (Oct 2026).
      {
        source: '/convert/wells-fargo-pdf-to-excel',
        destination: '/convert/wells-fargo-bank-statement-to-excel',
        permanent: true,
      },
      {
        source: '/convert/bank-of-america-statement-to-csv',
        destination: '/convert/bank-of-america-statement-to-excel',
        permanent: true,
      },
      // Slug renamed to match the page's intent (financial PDFs, not a generic PDF converter).
      {
        source: '/convert/pdf-to-excel-converter',
        destination: '/convert/financial-pdf-to-excel',
        permanent: true,
      },
      // /about is the one About & Contact page; the aliases redirect instead of duplicating it.
      {
        source: '/about-us',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/about#contact-details',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
