import type { Metadata } from 'next';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'View and manage your shopping cart',
  openGraph: {
    title: 'Shopping Cart - Festival Rave Gear',
    description: 'View and manage your shopping cart at Festival Rave Gear',
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
