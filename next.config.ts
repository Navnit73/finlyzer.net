import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
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
  async redirects() {
    return [
      // One canonical host: nginx serves both finlyzers.com and www, so send www to the apex.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.finlyzers.com' }],
        destination: 'https://finlyzers.com/:path*',
        permanent: true,
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
    ];
  },
};

export default nextConfig;
