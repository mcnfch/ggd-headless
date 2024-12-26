import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop - Groovy Gallery Designs',
  description: 'Browse our collection of unique and beautiful products.',
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
