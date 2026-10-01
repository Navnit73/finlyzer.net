import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finlyzer — Financial Analysis & Valuation Tools Hub",
  description: "High-contrast, AI-powered financial tool hub for DCF modeling, statement analysis, ratio auditing, and portfolio intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-white text-[#171717] font-sans antialiased selection:bg-[#70F000] selection:text-[#141414]">
        {children}
      </body>
    </html>
  );
}


