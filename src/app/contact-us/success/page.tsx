import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Message Sent Successfully | Festival Rave Gear',
  description: 'Your message has been sent successfully. We will get back to you shortly.',
};

export default function ContactSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
      <div className="backdrop-blur-sm bg-white/70 rounded-lg shadow-xl p-8">
        <div className="space-y-6">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">Message Sent Successfully!</h1>
          
          <p className="text-xl text-gray-600">
            Thank you for contacting us. We have received your message and will get back to you shortly.
          </p>

          <div className="text-gray-600">
            <p className="mb-2 font-semibold">What happens next?</p>
            <ul className="list-disc list-inside text-left space-y-2">
              <li>Our team will review your inquiry</li>
              <li>You will receive an email confirmation</li>
              <li>We aim to respond within 24-48 business hours</li>
            </ul>
          </div>

          <div className="pt-6">
            <Link 
              href="/" 
              className="inline-block bg-purple-600 text-white py-3 px-8 rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
