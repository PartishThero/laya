// context/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3200) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Editorial floating toasts container */}
      <div 
        className="fixed bottom-24 right-6 z-[1100] flex flex-col gap-2 pointer-events-none select-none"
        aria-live="polite"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-2.5 rounded-sm border shadow-md text-xs font-mono tracking-tight flex items-center gap-3 transition-all transform animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'error'
                ? 'bg-paper text-danger border-danger/40'
                : toast.type === 'success'
                ? 'bg-paper text-success border-success/40'
                : 'bg-paper text-ink border-rule'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-ink-soft hover:text-ink cursor-pointer"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
