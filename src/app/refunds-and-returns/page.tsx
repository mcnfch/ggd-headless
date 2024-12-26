import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refunds and Returns Policy | Festival Rave Gear',
  description: 'Learn about our refunds and returns policy at Festival Rave Gear. We want you to be completely satisfied with your purchase.',
};

export default function RefundsAndReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="backdrop-blur-sm bg-white/70 rounded-lg shadow-xl p-8">
        <div className="prose prose-xl max-w-none text-gray-800 font-medium">
          <h1 className="text-4xl font-bold mb-8 text-gray-900">Refunds and Returns Policy</h1>

          <section className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Return Policy</h2>
            <p className="mb-4 text-xl">
              We want you to be completely satisfied with your purchase. If you are not satisfied,
              you may return most items within 30 days of delivery for a full refund.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Return Guidelines</h3>
            <ul className="list-disc pl-6 space-y-3 text-xl">
              <li>Items must be returned in their original condition and packaging</li>
              <li>Items must be unused and in resalable condition</li>
              <li>All accessories and documentation must be included</li>
              <li>Return shipping costs are the responsibility of the customer</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Refund Process</h2>
            <p className="mb-2 text-xl">Once we receive your return:</p>
            <ol className="list-decimal pl-6 space-y-3 text-xl">
              <li>We will inspect the item within 2 business days</li>
              <li>If approved, your refund will be processed within 3-5 business days</li>
              <li>Refunds will be credited to the original payment method</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Non-Returnable Items</h2>
            <ul className="list-disc pl-6 space-y-3 text-xl">
              <li>Custom or personalized orders</li>
              <li>Downloadable software products</li>
              <li>Items marked as final sale</li>
              <li>Gift cards</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Contact Us</h2>
            <p className="text-xl">
              If you have any questions about our returns policy, please contact our customer
              service team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
