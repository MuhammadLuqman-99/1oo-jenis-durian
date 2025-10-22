'use client';

import { ReactNode } from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  children?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <Icon className="text-gray-400" size={48} aria-hidden="true" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">{title}</h3>

      {description && (
        <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          icon={action.icon}
          variant="primary"
        >
          {action.label}
        </Button>
      )}

      {children}
    </div>
  );
}

interface NoDataProps {
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function NoData({ message = 'No data available', action }: NoDataProps) {
  return (
    <EmptyState
      title={message}
      description="There is no data to display at the moment."
      action={action}
    />
  );
}

interface NoResultsProps {
  searchTerm?: string;
  onClear?: () => void;
}

export function NoResults({ searchTerm, onClear }: NoResultsProps) {
  return (
    <EmptyState
      title="No results found"
      description={
        searchTerm
          ? `No results found for "${searchTerm}". Try adjusting your search.`
          : 'No results match your current filters.'
      }
      action={
        onClear
          ? {
              label: 'Clear filters',
              onClick: onClear,
            }
          : undefined
      }
    />
  );
}
