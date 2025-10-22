'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface PhotoViewerProps {
  isOpen: boolean;
  photoUrl: string;
  onClose: () => void;
}

export default function PhotoViewer({ isOpen, photoUrl, onClose }: PhotoViewerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus the close button when modal opens
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
    >
      <div className="relative max-w-5xl w-full">
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors z-10 focus-ring"
          aria-label="Close photo viewer"
        >
          <X size={24} />
        </button>
        <img
          src={photoUrl}
          alt="Full size view"
          className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
