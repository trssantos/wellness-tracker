import React from 'react';

const InputField = ({ 
  icon: Icon, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false,
  className = ""
}) => {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-800 dark:text-slate-400 pointer-events-none">
        {Icon && <Icon size={18} />}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-10 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-colors ${className}`}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default InputField;