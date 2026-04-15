import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SINYAL - AI Football Predictions",
  description: "AI-powered football match predictions with statistical analysis. Get accurate betting predictions for today's matches with real bookmaker odds.",
  keywords: ["football", "predictions", "betting", "AI", "statistics", "futbol", "tahmin", "iddaa", "banko", "mac tahminleri"],
  manifest: "/manifest.json",
  openGraph: {
    title: "SINYAL - AI Football Predictions",
    description: "AI-powered football match predictions with real bookmaker odds",
    type: "website",
    siteName: "SINYAL",
  },
  twitter: {
    card: "summary_large_image",
    title: "SINYAL - AI Football Predictions",
    description: "AI-powered football match predictions with real bookmaker odds",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.className} h-full antialiased`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
