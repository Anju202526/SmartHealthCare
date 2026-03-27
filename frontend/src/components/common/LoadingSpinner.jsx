import React from 'react';

/**
 * Usage:
 *   <LoadingSpinner />                  — centred fullscreen overlay
 *   <LoadingSpinner inline />           — small inline spinner
 *   <LoadingSpinner size="sm|md|lg" />
 */
const sizeMap = {
  sm: 'h-5 w-5 border-2',
  md: 'h-10 w-10 border-2',
  lg: 'h-14 w-14 border-4',
};

const LoadingSpinner = ({ inline = false, size = 'lg' }) => {
  const spinner = (
    <div
      className={[
        'rounded-full border-teal-500 border-t-transparent animate-spin',
        sizeMap[size] || sizeMap.lg,
      ].join(' ')}
      role="status"
      aria-label="Loading"
    />
  );

  if (inline) return spinner;

  return (
    <div className="fixed inset-0 bg-white/75 flex items-center justify-center z-50">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
