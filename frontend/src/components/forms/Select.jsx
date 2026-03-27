import React from 'react';

const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
}) => (
  <div className="w-full">
    {label && (
      <label className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </label>
    )}
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={`w-full p-2.5 border-2 border-gray-200 rounded-lg
        focus:border-teal-500 outline-none transition-colors appearance-none
        bg-white text-sm disabled:bg-gray-50 disabled:cursor-not-allowed
        ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239c9c98' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        paddingRight: '2rem',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => {
        const val   = typeof opt === 'object' ? opt.value : opt;
        const label = typeof opt === 'object' ? opt.label : opt;
        return (
          <option key={val} value={val}>
            {label}
          </option>
        );
      })}
    </select>
  </div>
);

export default Select;
