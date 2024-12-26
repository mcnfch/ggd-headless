'use client';

import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { Header } from './Header';
import { Footer } from './Footer';
import type { WooCategory } from '@/lib/types';

interface ClientLayoutProps {
  children: React.ReactNode;
  categories: WooCategory[];
}

export function ClientLayout({ children, categories }: ClientLayoutProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="flex flex-col min-h-screen">
          <Header categories={categories} />
          <main className="flex-grow mb-16 main-content">
            {children}
          </main>
          <Footer categories={categories} />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
