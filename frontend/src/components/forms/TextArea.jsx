import React from 'react';

const TextArea = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  className = '',
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </label>
    )}
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={rows}
      className={`w-full p-2.5 border-2 border-gray-200 rounded-lg focus:border-teal-500
        outline-none transition-colors resize-y font-sans text-sm ${className}`}
    />
  </div>
);

export default TextArea;
