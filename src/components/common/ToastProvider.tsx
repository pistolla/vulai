import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  nextAction?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, nextAction?: string) => void;
  error: (title: string, message?: string, nextAction?: string) => void;
  warning: (title: string, message?: string, nextAction?: string) => void;
  info: (title: string, message?: string, nextAction?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastIcons = {
  success: FiCheckCircle,
  error: FiXCircle,
  warning: FiAlertTriangle,
  info: FiInfo,
};

const toastStyles = {
  success: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-500 dark:text-green-400',
    title: 'text-green-800 dark:text-green-200',
    message: 'text-green-700 dark:text-green-300',
    nextAction: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800/50 hover:bg-green-200 dark:hover:bg-green-800',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-500 dark:text-red-400',
    title: 'text-red-800 dark:text-red-200',
    message: 'text-red-700 dark:text-red-300',
    nextAction: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800/50 hover:bg-red-200 dark:hover:bg-red-800',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-500 dark:text-amber-400',
    title: 'text-amber-800 dark:text-amber-200',
    message: 'text-amber-700 dark:text-amber-300',
    nextAction: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-800/50 hover:bg-amber-200 dark:hover:bg-amber-800',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-500 dark:text-blue-400',
    title: 'text-blue-800 dark:text-blue-200',
    message: 'text-blue-700 dark:text-blue-300',
    nextAction: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800/50 hover:bg-blue-200 dark:hover:bg-blue-800',
  },
};

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const styles = toastStyles[toast.type];
  const Icon = toastIcons[toast.type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg ${styles.bg} ${styles.border} animate-in slide-in-from-right duration-300`}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${styles.icon}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${styles.title}`}>{toast.title}</p>
        {toast.message && (
          <p className={`text-sm mt-1 ${styles.message}`}>{toast.message}</p>
        )}
        {toast.nextAction && (
          <div className="mt-2">
            <span className={`text-xs px-2 py-1 rounded-md font-medium ${styles.nextAction}`}>
              💡 Next: {toast.nextAction}
            </span>
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className={`flex-shrink-0 p-1 rounded-lg hover:bg-white/50 dark:hover:bg-black/20 transition-colors ${styles.icon}`}
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration (default 5 seconds)
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string, nextAction?: string) => {
    addToast({ type: 'success', title, message, nextAction });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, nextAction?: string) => {
    addToast({ type: 'error', title, message, nextAction });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, nextAction?: string) => {
    addToast({ type: 'warning', title, message, nextAction });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, nextAction?: string) => {
    addToast({ type: 'info', title, message, nextAction });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm w-full">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
