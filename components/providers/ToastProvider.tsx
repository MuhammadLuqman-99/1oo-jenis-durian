'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        className: '',
        duration: 4000,

        // Default styles
        style: {
          background: '#fff',
          color: '#374151',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          maxWidth: '500px',
          fontSize: '14px',
          fontWeight: '500',
        },

        // Success toast styles
        success: {
          duration: 3000,
          style: {
            background: 'linear-gradient(to right, #10b981, #059669)',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
          },
        },

        // Error toast styles
        error: {
          duration: 5000,
          style: {
            background: 'linear-gradient(to right, #ef4444, #dc2626)',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        },

        // Loading toast styles
        loading: {
          style: {
            background: 'linear-gradient(to right, #3b82f6, #2563eb)',
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#3b82f6',
          },
        },
      }}
    />
  );
}
