import React from 'react';

const variants = {
  primary:   'bg-ink text-white hover:bg-gray-800 disabled:opacity-50',
  secondary: 'bg-teal-500 text-white hover:bg-teal-600 disabled:opacity-50',
  outline:   'border-2 border-gray-200 bg-white text-gray-700 hover:border-gray-400 disabled:opacity-50',
  danger:    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50',
  ghost:     'bg-transparent text-gray-500 hover:text-ink disabled:opacity-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({
  children,
  variant  = 'primary',
  size     = 'md',
  fullWidth = false,
  loading  = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={[
      'rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2',
      variants[variant] || variants.primary,
      sizes[size]       || sizes.md,
      fullWidth ? 'w-full' : '',
      className,
    ].join(' ')}
  >
    {loading && (
      <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    )}
    {children}
  </button>
);

export default Button;
