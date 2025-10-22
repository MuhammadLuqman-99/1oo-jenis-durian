'use client';

import { ReactNode } from 'react';
import { X, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  onClose?: () => void;
  className?: string;
  icon?: boolean;
}

export default function Alert({
  children,
  variant = 'info',
  title,
  onClose,
  className = '',
  icon = true,
}: AlertProps) {
  const variantConfig = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-500',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
      iconColor: 'text-red-500',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} ${config.border} ${config.text} border-2 rounded-lg p-4 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <Icon className={`${config.iconColor} flex-shrink-0 mt-0.5`} size={20} aria-hidden="true" />
        )}

        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0 focus-ring rounded`}
            aria-label="Close alert"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

interface AlertListProps {
  alerts: Array<{
    id: string;
    variant: 'info' | 'success' | 'warning' | 'danger';
    title?: string;
    message: string;
  }>;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function AlertList({ alerts, onDismiss, className = '' }: AlertListProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant}
          title={alert.title}
          onClose={onDismiss ? () => onDismiss(alert.id) : undefined}
        >
          {alert.message}
        </Alert>
      ))}
    </div>
  );
}
