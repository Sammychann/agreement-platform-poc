import React from 'react';

const FormField = ({ label, type = 'text', name, value, onChange, required = false, error, placeholder = '', options = [] }) => {
  const baseClasses = `block w-full rounded-md shadow-sm sm:text-sm ${
    error 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-msd-teal focus:border-msd-teal'
  } py-2 px-3 border`;

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          rows={3}
          className={baseClasses}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
        />
      ) : type === 'select' ? (
        <select
          id={name}
          name={name}
          className={baseClasses}
          value={value}
          onChange={onChange}
          required={required}
        >
          <option value="" disabled>Select {label}</option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          className={baseClasses}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${name}-error`}>{error}</p>
      )}
    </div>
  );
};

export default FormField;
