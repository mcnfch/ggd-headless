import { getPageBySlug } from '@/lib/woocommerce';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import '@/styles/wordpress.css';
import '@/styles/wordpress-blocks.css';

export const metadata: Metadata = {
  title: 'Shipping | Groovy Gallery Designs',
  description: 'Learn about our shipping policies and delivery times at Groovy Gallery Designs.',
};

export default async function ShippingPage() {
  const page = await getPageBySlug('shipping');

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="backdrop-blur-sm bg-white/70 rounded-lg shadow-xl p-8">
          <div className="prose prose-xl max-w-none text-gray-800 font-medium wp-content">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">
              Shipping
            </h1>
            <p>
              Our shipping information is currently being updated. Please check back soon for our complete shipping policies.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="backdrop-blur-sm bg-white/70 rounded-lg shadow-xl p-8">
        <div className="prose prose-xl max-w-none text-gray-800 font-medium wp-content">
          <h1 
            className="text-4xl font-bold mb-8 text-gray-900"
            dangerouslySetInnerHTML={{ __html: page.title.rendered }}
          />
          <div 
            dangerouslySetInnerHTML={{ __html: page.content.rendered }}
          />
        </div>
      </div>
    </div>
  );
}
