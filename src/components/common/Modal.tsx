import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  fullScreen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  fullScreen = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className={`flex min-h-full items-center justify-center ${fullScreen ? 'p-0 sm:p-4' : 'p-4'}`}>
        {/* Modal Panel */}
        <div className={`relative w-full transform overflow-hidden bg-white dark:bg-gray-800 text-left shadow-xl transition-all border border-gray-100 dark:border-gray-700 flex flex-col ${fullScreen
            ? 'min-h-screen sm:min-h-0 sm:max-h-[90vh] sm:rounded-2xl max-w-7xl'
            : 'max-h-[90vh] rounded-2xl max-w-4xl'
          }`}>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 p-4 sm:p-6 pb-2 sm:pb-4">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span className="sr-only">Close</span>
              <FiX className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-gray-100 dark:border-gray-700 p-4 sm:p-6 pt-2 sm:pt-4 flex justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use createPortal if document is available, otherwise render inline (for SSR safety)
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
};
