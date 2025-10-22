'use client';

import { useState } from 'react';
import { Menu, X, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
}

interface MobileNavProps {
  items: NavItem[];
  logo?: React.ReactNode;
  userMenu?: React.ReactNode;
  className?: string;
}

export default function MobileNav({
  items,
  logo,
  userMenu,
  className = '',
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Header */}
      <div className={`lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 ${className}`}>
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo */}
          <div className="flex-shrink-0">{logo}</div>

          {/* Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-ring"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar */}
          <div
            className="lg:hidden fixed top-16 left-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl z-50 overflow-y-auto animate-in slide-in-from-left duration-300"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {/* User Menu */}
            {userMenu && (
              <div className="border-b border-gray-200 p-4">{userMenu}</div>
            )}

            {/* Navigation Items */}
            <nav className="p-4 space-y-2">
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[48px] ${
                      active
                        ? 'bg-blue-50 text-blue-600 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {Icon && <Icon size={20} className="flex-shrink-0" />}
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </>
  );
}

interface BottomNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface BottomNavProps {
  items: BottomNavItem[];
  className?: string;
}

export function BottomNav({ items, className = '' }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom ${className}`}
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="grid grid-cols-4 gap-1 px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-colors min-h-[56px] relative ${
                active
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <div className="relative">
                <Icon size={24} className={active ? 'stroke-[2.5]' : 'stroke-2'} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
