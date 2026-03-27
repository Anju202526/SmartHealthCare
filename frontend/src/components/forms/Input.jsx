import React from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  icon = null,
  className = '',
  disabled = false,
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </label>
    )}
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full p-2.5 border-2 border-gray-200 rounded-lg
          focus:border-teal-500 outline-none transition-colors text-sm
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${icon ? 'pl-10' : ''}
          ${className}`}
      />
    </div>
  </div>
);

export default Input;
