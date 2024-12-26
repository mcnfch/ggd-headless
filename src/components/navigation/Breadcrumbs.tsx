'use client';

import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="text-sm py-4" aria-label="Breadcrumb">
      {items.filter(Boolean).map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {index > 0 && <span className="mx-2">/</span>}
          {item?.href ? (
            <Link 
              href={item.href}
              className="text-purple-600 hover:text-purple-700"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-500">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
