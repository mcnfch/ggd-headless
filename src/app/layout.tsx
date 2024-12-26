import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { Orbitron } from 'next/font/google';
import "./globals.css";
import { ClientLayout } from '@/components/layout/ClientLayout';
import { getCategories } from '@/lib/woocommerce';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-orbitron',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || ''),
  title: {
    template: '%s | Groovy Gallery Designs',
    default: 'Groovy Gallery Designs | Unique Fashion & Accessories',
  },
  description: 'Discover unique and groovy fashion accessories at Groovy Gallery Designs. Shop our collection of sunglasses, jewelry, and more.',
  keywords: ['festival', 'rave', 'clothing', 'accessories', 'fashion'],
  authors: [{ name: 'Groovy Gallery Designs' }],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL
  },
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: 'Groovy Gallery Designs',
    description: 'Your Ultimate Festival Fashion Destination',
    siteName: 'Groovy Gallery Designs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Groovy Gallery Designs',
    description: 'Your Ultimate Festival Fashion Destination',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <html lang="en">
      <body className={`${inter.variable} ${orbitron.variable}`}>
        <ClientLayout categories={categories}>{children}</ClientLayout>
      </body>
    </html>
  );
}
