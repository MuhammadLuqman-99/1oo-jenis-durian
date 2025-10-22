'use client';

import { ReactNode, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export default function Tabs({
  tabs,
  defaultTab,
  onChange,
  className = '',
  variant = 'default',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (onChange) {
      onChange(tabId);
    }
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  const getTabClasses = (tab: Tab) => {
    const isActive = activeTab === tab.id;
    const baseClasses = 'px-4 py-2 font-medium transition-all focus-ring';

    switch (variant) {
      case 'pills':
        return `${baseClasses} rounded-lg ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`;

      case 'underline':
        return `${baseClasses} border-b-2 ${
          isActive
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-700 hover:text-blue-600 hover:border-gray-300'
        }`;

      default:
        return `${baseClasses} rounded-t-lg border-2 border-b-0 ${
          isActive
            ? 'bg-white border-gray-200 text-blue-600'
            : 'bg-gray-50 border-transparent text-gray-700 hover:bg-gray-100'
        }`;
    }
  };

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div
        className={`flex gap-2 ${
          variant === 'underline' ? 'border-b-2 border-gray-200' : ''
        }`}
        role="tablist"
        aria-label="Tabs"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={`${getTabClasses(tab)} ${
                tab.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
            >
              <span className="flex items-center gap-2">
                {Icon && <Icon size={16} />}
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div
        className={`${
          variant === 'default' ? 'bg-white border-2 border-gray-200 rounded-b-lg rounded-tr-lg p-6' : 'mt-4'
        }`}
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTabContent}
      </div>
    </div>
  );
}

interface ControlledTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

export function ControlledTabs({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'default',
}: ControlledTabsProps) {
  return (
    <Tabs
      tabs={tabs}
      defaultTab={activeTab}
      onChange={onChange}
      className={className}
      variant={variant}
    />
  );
}
