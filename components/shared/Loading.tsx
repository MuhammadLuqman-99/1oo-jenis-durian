'use client';

import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function Loading({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className = '',
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const LoadingComponent = () => {
    switch (variant) {
      case 'spinner':
        return (
          <Loader2
            className={`${sizeClasses[size]} animate-spin text-blue-600`}
            aria-hidden="true"
          />
        );

      case 'dots':
        return (
          <div className="flex gap-2">
            <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
            <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
            <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
          </div>
        );

      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`} />
        );

      default:
        return null;
    }
  };

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <LoadingComponent />
      {text && (
        <p className="text-gray-600 text-sm font-medium">{text}</p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  text?: string;
}

export function LoadingOverlay({ loading, children, text }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <Loading text={text} />
        </div>
      )}
    </div>
  );
}

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export function Skeleton({
  width = 'w-full',
  height = 'h-4',
  className = '',
  variant = 'rectangular',
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={`${width} ${height} ${variantClasses[variant]} bg-gray-200 animate-pulse ${className}`}
      aria-hidden="true"
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
  className?: string;
}

export function SkeletonCard({ lines = 3, className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 space-y-4 ${className}`}>
      <Skeleton height="h-6" width="w-3/4" />
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton key={idx} height="h-4" width={idx === lines - 1 ? 'w-1/2' : 'w-full'} />
      ))}
    </div>
  );
}

// Skeleton for tree card
export function SkeletonTreeCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 animate-in fade-in duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton height="h-8" width="w-32" /> {/* Tree number */}
          <Skeleton height="h-5" width="w-48" /> {/* Variety */}
        </div>
        <Skeleton height="h-10" width="w-20" variant="rectangular" /> {/* Badge */}
      </div>

      <div className="space-y-2">
        <Skeleton height="h-4" width="w-full" />
        <Skeleton height="h-4" width="w-3/4" />
        <Skeleton height="h-4" width="w-5/6" />
      </div>

      <div className="flex gap-2 pt-2">
        <Skeleton height="h-10" width="w-24" variant="rectangular" />
        <Skeleton height="h-10" width="w-24" variant="rectangular" />
      </div>
    </div>
  );
}

// Skeleton for table rows
export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-200 animate-in fade-in duration-300">
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="px-4 py-3">
          <Skeleton height="h-4" width={idx === 0 ? 'w-16' : 'w-full'} />
        </td>
      ))}
    </tr>
  );
}

// Skeleton for health records
export function SkeletonHealthRecord() {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-3 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <Skeleton height="h-6" width="w-32" />
        <Skeleton height="h-8" width="w-24" variant="rectangular" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Skeleton height="h-4" width="w-20" />
          <Skeleton height="h-4" width="w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton height="h-4" width="w-20" />
          <Skeleton height="h-4" width="w-28" />
        </div>
      </div>
      <Skeleton height="h-16" width="w-full" />
      <div className="flex gap-2">
        <Skeleton height="h-9" width="w-20" variant="rectangular" />
        <Skeleton height="h-9" width="w-20" variant="rectangular" />
      </div>
    </div>
  );
}

// Skeleton for stats card
export function SkeletonStatsCard() {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 space-y-3 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <Skeleton height="h-5" width="w-32" />
        <Skeleton height="h-10" width="w-10" variant="circular" />
      </div>
      <Skeleton height="h-10" width="w-24" />
      <Skeleton height="h-4" width="w-40" />
    </div>
  );
}

// Skeleton for dashboard grid
export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonStatsCard />
        <SkeletonStatsCard />
        <SkeletonStatsCard />
        <SkeletonStatsCard />
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard lines={5} />
        <SkeletonCard lines={5} />
      </div>
    </div>
  );
}
