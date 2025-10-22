'use client';

import { ReactNode } from 'react';
import { ChevronRight, Home, LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  showHome?: boolean;
  homeHref?: string;
  className?: string;
}

export default function Breadcrumb({
  items,
  separator = <ChevronRight size={16} className="text-gray-400" />,
  showHome = true,
  homeHref = '/',
  className = '',
}: BreadcrumbProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Home', href: homeHref, icon: Home }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap gap-2 text-sm">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center gap-2">
              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors focus-ring rounded"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {Icon && <Icon size={16} />}
                  <span className={isLast ? 'font-semibold text-gray-900' : ''}>
                    {item.label}
                  </span>
                </Link>
              ) : item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors focus-ring rounded"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {Icon && <Icon size={16} />}
                  <span className={isLast ? 'font-semibold text-gray-900' : ''}>
                    {item.label}
                  </span>
                </button>
              ) : (
                <span
                  className="flex items-center gap-1.5 text-gray-900 font-semibold"
                  aria-current="page"
                >
                  {Icon && <Icon size={16} />}
                  {item.label}
                </span>
              )}

              {!isLast && <span aria-hidden="true">{separator}</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

interface SimpleBreadcrumbProps {
  items: string[];
  className?: string;
}

export function SimpleBreadcrumb({ items, className = '' }: SimpleBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap gap-2 text-sm text-gray-600">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              <span className={isLast ? 'font-semibold text-gray-900' : ''}>
                {item}
              </span>
              {!isLast && (
                <ChevronRight size={16} className="text-gray-400" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
