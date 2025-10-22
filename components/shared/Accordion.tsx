'use client';

import { ReactNode, useState } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: LucideIcon;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
  className?: string;
  onChange?: (openItems: string[]) => void;
}

export default function Accordion({
  items,
  allowMultiple = false,
  defaultOpen = [],
  className = '',
  onChange,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (itemId: string) => {
    let newOpenItems: string[];

    if (openItems.includes(itemId)) {
      // Close the item
      newOpenItems = openItems.filter((id) => id !== itemId);
    } else {
      // Open the item
      if (allowMultiple) {
        newOpenItems = [...openItems, itemId];
      } else {
        newOpenItems = [itemId];
      }
    }

    setOpenItems(newOpenItems);
    if (onChange) {
      onChange(newOpenItems);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        const Icon = item.icon;

        return (
          <div
            key={item.id}
            className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              className={`w-full px-6 py-4 flex items-center justify-between text-left transition-colors ${
                item.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-50'
              } focus-ring`}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
              id={`accordion-header-${item.id}`}
            >
              <span className="flex items-center gap-3">
                {Icon && <Icon size={20} className="text-gray-600" />}
                <span className="font-semibold text-gray-900">{item.title}</span>
              </span>
              <ChevronDown
                size={20}
                className={`text-gray-600 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {isOpen && (
              <div
                id={`accordion-content-${item.id}`}
                role="region"
                aria-labelledby={`accordion-header-${item.id}`}
                className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50 animate-in slide-in-from-top-2 duration-200"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface SimpleAccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function SimpleAccordion({
  title,
  children,
  defaultOpen = false,
  className = '',
}: SimpleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white border-2 border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors focus-ring"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-gray-900">{title}</span>
        <ChevronDown
          size={20}
          className={`text-gray-600 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}
