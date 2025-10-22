'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface DropdownItem {
  label: string;
  value: string;
  icon?: LucideIcon;
  disabled?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  position?: 'left' | 'right';
  className?: string;
  onSelect?: (value: string) => void;
}

export default function Dropdown({
  trigger,
  items,
  position = 'left',
  className = '',
  onSelect,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (item: DropdownItem) => {
    if (item.disabled) return;

    if (item.onClick) {
      item.onClick();
    }

    if (onSelect) {
      onSelect(item.value);
    }

    setIsOpen(false);
  };

  const positionClasses = position === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${positionClasses} mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200`}
          role="menu"
          aria-orientation="vertical"
        >
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.value}
                onClick={() => handleSelect(item)}
                disabled={item.disabled}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                  item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                } focus-ring`}
                role="menuitem"
              >
                {Icon && <Icon size={16} />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string; icon?: LucideIcon }>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SelectDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
}: SelectDropdownProps) {
  const selectedOption = options.find((opt) => opt.value === value);

  const trigger = (
    <button
      disabled={disabled}
      className={`w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-left flex items-center justify-between gap-2 transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:border-gray-300 focus:border-blue-500'
      } focus-ring ${className}`}
    >
      <span className="flex items-center gap-2">
        {selectedOption?.icon && <selectedOption.icon size={16} />}
        <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
      </span>
      <ChevronDown size={16} className="text-gray-400" />
    </button>
  );

  return (
    <Dropdown
      trigger={trigger}
      items={options.map((opt) => ({
        ...opt,
        disabled: disabled,
      }))}
      onSelect={onChange}
      className="w-full"
    />
  );
}
