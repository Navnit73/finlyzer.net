import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://finlyzers.com'),
  title: {
    default: "Finlyzer — AI Bank Statement to Excel & CSV Converter",
    template: "%s | Finlyzer",
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
  authors: [{ name: "Finlyzer Team", url: "https://finlyzers.com" }],
  creator: "Finlyzer",
  publisher: "Finlyzer",
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
    url: "https://finlyzers.com",
    siteName: "Finlyzer",
    title: "Finlyzer — AI Bank Statement to Excel & CSV Converter",
    description:
      "Convert PDF bank statements to Excel, CSV, QuickBooks QBO, and Xero OFX with 99.8% precision, OCR, and automated balance reconciliation.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Finlyzer — AI Bank Statement to Excel & CSV Converter",
    description:
      "Convert PDF bank statements to Excel, CSV, QuickBooks QBO, and Xero OFX with 99.8% precision, OCR, and automated balance reconciliation.",
  },
  icons: {
    icon: "/favicon.ico",
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
      <body className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] font-sans antialiased selection:bg-[var(--color-brand)] selection:text-[var(--color-on-brand)]">
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}



