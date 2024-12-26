import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { WooProduct } from '@/types/woocommerce';

interface QuickAddModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  product: WooProduct;
  onAddToCart: () => void;
}

export function QuickAddModal({ isOpen, setIsOpen, product, onAddToCart }: QuickAddModalProps) {
  const { addToCart } = useCart();
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    try {
      await addToCart({
        product_id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: quantity,
        image: product.images[0]?.src,
        variation_id: 0, // Add proper variation ID handling if needed
        attributes: Object.entries(selectedAttributes).map(([name, value]) => ({
          name,
          value
        }))
      });
      onAddToCart();
    } catch (error) {
      console.error('Error adding product to cart:', error);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {product.name}
                    </Dialog.Title>
                    
                    <div className="mt-4">
                      <div className="relative w-full h-64 mb-4">
                        <Image
                          src={product.images[0]?.src || '/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Attributes */}
                      {product.attributes && product.attributes.map((attribute) => (
                        <div key={attribute.id} className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {attribute.name}
                          </label>
                          <select
                            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                            value={selectedAttributes[attribute.name] || ''}
                            onChange={(e) => setSelectedAttributes(prev => ({
                              ...prev,
                              [attribute.name]: e.target.value
                            }))}
                          >
                            <option value="">Select {attribute.name}</option>
                            {attribute.options?.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}

                      {/* Quantity */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-purple-500 focus:outline-none focus:ring-purple-500 sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 sm:ml-3 sm:w-auto"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
