'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  className?: string;
  rounded?: boolean;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className = '',
  rounded = true,
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-purple-100 text-purple-800',
    neutral: 'bg-gray-100 text-gray-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  const roundedClass = rounded ? 'rounded-full' : 'rounded';

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${variantClasses[variant]} ${sizeClasses[size]} ${roundedClass} ${className}`}
    >
      {Icon && <Icon size={iconSizes[size]} />}
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'Sihat' | 'Sederhana' | 'Sakit' | string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getVariant = (status: string): 'success' | 'warning' | 'danger' | 'neutral' => {
    switch (status) {
      case 'Sihat':
        return 'success';
      case 'Sederhana':
        return 'warning';
      case 'Sakit':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <Badge variant={getVariant(status)} className={className}>
      {status}
    </Badge>
  );
}
