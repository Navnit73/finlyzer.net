import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/seo-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Finlyzers — AI Bank Statement to Excel & CSV Converter",
    template: "%s | Finlyzers",
  },
  description:
    "Convert PDF bank statements and financial documents to Excel (XLSX), CSV, QuickBooks (QBO), and Xero (OFX) with 99.8% precision, OCR, and automated balance reconciliation.",
  keywords: [
    "bank statement converter",
    "convert PDF bank statement to Excel",
    "bank statement to CSV",
    "PDF to Excel converter",
    "bank statement to QuickBooks",
    "bank statement to QBO",
    "bank statement to Xero OFX",
    "scanned bank statement OCR",
    "Chase bank statement to Excel",
    "Bank of America statement to CSV",
    "Wells Fargo statement to Excel",
    "HDFC bank statement to Excel",
  ],
  authors: [{ name: "Finlyzers Team", url: SITE_URL }],
  creator: "Finlyzers",
  publisher: "Finlyzers",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Finlyzers",
    title: "Finlyzers — AI Bank Statement to Excel & CSV Converter",
    description:
      "Convert PDF bank statements to Excel, CSV, QuickBooks QBO, and Xero OFX with 99.8% precision, OCR, and automated balance reconciliation.",
    images: [
      {
        url: "/og_image.webp",
        width: 1200,
        height: 630,
        alt: "Finlyzers — AI Bank Statement to Excel, CSV & QuickBooks Converter",
        type: "image/webp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Finlyzers — AI Bank Statement to Excel & CSV Converter",
    description:
      "Convert PDF bank statements to Excel, CSV, QuickBooks QBO, and Xero OFX with 99.8% precision, OCR, and automated balance reconciliation.",
    images: ["/og_image.webp"],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

import { AuthProvider } from "@/components/auth/AuthProvider";
import AppShell from "@/components/layout/AppShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className={`${geistSans.variable} ${geistMono.variable}`}>
  <Head>
    <script async src="https://www.clarity.ms/tag/yszul1h2c2"></script>
  </Head>      <body className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] font-sans antialiased selection:bg-[var(--color-brand)] selection:text-[var(--color-on-brand)]">
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}



