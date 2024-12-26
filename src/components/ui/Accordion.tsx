'use client';

import { useState } from 'react';

interface AccordionProps {
  title: string;
  preview: string;
  content: string;
  className?: string;
}

export function Accordion({ title, preview, content, className = '' }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${className} overflow-hidden`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left focus:outline-none group"
      >
        <div className="flex flex-col space-y-2">
          <h2 className="text-xl md:text-3xl font-orbitron text-center mb-2 tracking-wider group-hover:text-purple-700 transition-colors">
            {title}
          </h2>
          <p className="text-base md:text-lg leading-relaxed text-center font-medium">
            {preview}
          </p>
          <div className="flex justify-center mt-2">
            <span className={`
              inline-flex items-center justify-center w-8 h-8 rounded-full 
              border-2 border-purple-600 text-purple-600
              transition-transform duration-300 ease-in-out
              ${isOpen ? 'rotate-180' : ''}
              group-hover:bg-purple-600 group-hover:text-white
            `}>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
        </div>
      </button>

      <div
        className={`
          transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}
        `}
      >
        <p className="text-gray-700 text-lg leading-relaxed text-center">
          {content}
        </p>
      </div>
    </div>
  );
}
