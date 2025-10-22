'use client';

import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks';

interface MobileTableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => ReactNode;
  primary?: boolean; // Show on mobile card view
}

interface MobileTableProps<T> {
  data: T[];
  columns: MobileTableColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  className?: string;
}

export default function MobileTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  emptyMessage = 'No data available',
  className = '',
}: MobileTableProps<T>) {
  const isMobile = useIsMobile();

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 text-center text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className={`space-y-3 ${className}`}>
        {data.map((item, index) => {
          const primaryColumns = columns.filter(col => col.primary);
          const displayColumns = primaryColumns.length > 0 ? primaryColumns : columns.slice(0, 3);

          return (
            <div
              key={keyExtractor(item, index)}
              onClick={() => onRowClick && onRowClick(item)}
              className={`bg-white rounded-lg shadow-md p-4 ${
                onRowClick ? 'cursor-pointer active:bg-gray-50' : ''
              } transition-colors`}
            >
              <div className="space-y-2">
                {displayColumns.map((column) => (
                  <div key={column.key} className="flex justify-between items-start">
                    <span className="text-sm font-semibold text-gray-600 min-w-[100px]">
                      {column.label}:
                    </span>
                    <span className="text-sm text-gray-900 text-right flex-1">
                      {column.render ? column.render(item) : (item as any)[column.key]}
                    </span>
                  </div>
                ))}
              </div>
              {onRowClick && (
                <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                onClick={() => onRowClick && onRowClick(item)}
                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm">
                    {column.render ? column.render(item) : (item as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: MobileTableColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}: ResponsiveTableProps<T>) {
  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-8 text-center ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <MobileTable
      data={data}
      columns={columns}
      keyExtractor={keyExtractor}
      emptyMessage={emptyMessage}
      className={className}
    />
  );
}
