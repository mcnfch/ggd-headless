import { Metadata } from 'next';
import { getPageBySlug } from '@/lib/woocommerce';
import { notFound } from 'next/navigation';
import '@/styles/wordpress.css';
import '@/styles/wordpress-blocks.css';

export const metadata: Metadata = {
  title: 'Sustainability | Festival Rave Gear',
  description: 'Learn about our commitment to sustainability and eco-friendly practices at Festival Rave Gear.',
};

export default async function SustainabilityPage() {
  const page = await getPageBySlug('our-sustainability-practices');

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="backdrop-blur-sm bg-white/70 rounded-lg shadow-xl p-8">
          <div className="prose prose-xl max-w-none text-gray-800 font-medium wp-content">
            <h1 className="text-4xl font-bold mb-8 text-gray-900">
              Sustainability
            </h1>
            <p>
              Our sustainability page is currently being updated. Please check back soon to learn about our commitment to eco-friendly practices and sustainable fashion.
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
