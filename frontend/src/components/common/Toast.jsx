import React, { useEffect } from 'react';

const typeStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error:   'bg-red-50   border-red-200   text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info:    'bg-blue-50  border-blue-200  text-blue-800',
};

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 p-3 rounded-xl border shadow-lg max-w-xs
        flex items-center gap-2 text-sm font-medium animate-fade-in ${typeStyles[type]}`}
      role="alert"
    >
      {type === 'success' && (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {type === 'error' && (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      <span>{message}</span>
    </div>
  );
};

export default Toast;
