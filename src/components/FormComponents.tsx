import React, { forwardRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>((
  { 
    label, 
    name, 
    value, 
    onChange, 
    placeholder, 
    type = 'text', 
    required = false,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy
  }, 
  ref
) => {
  const { darkMode } = useTheme();
  
  return (
    <div>
      <label htmlFor={name} className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full p-2 border rounded-md focus:ring-2 focus:border-transparent ${
          darkMode
          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500'
          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500'
        } ${ariaInvalid ? 'border-red-500 dark:border-red-700' : ''}`}
        placeholder={placeholder}
        required={required}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        ref={ref}
      />
    </div>
  );
});

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  required = false,
  disabled = false
}) => {
  const { darkMode } = useTheme();
  
  return (
    <div>
      <label htmlFor={name} className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full p-2 border rounded-md focus:ring-2 focus:border-transparent appearance-none ${
           darkMode
           ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500'
           : 'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
        } ${disabled ? (darkMode ? 'opacity-50 cursor-not-allowed bg-gray-600' : 'opacity-50 cursor-not-allowed bg-gray-200') : ''}`}
        required={required}
        style={darkMode ? {
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem',
          } : {}}
      >
        {options.map(option => (
          <option key={option.value} value={option.value} className={darkMode ? 'bg-gray-700 text-white' : ''}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

interface ActionButtonProps {
  icon: React.ElementType;
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon: Icon, 
  text, 
  onClick, 
  variant = 'primary', 
  className = '', 
  fullWidth = false,
  disabled = false
}) => {
  const { darkMode } = useTheme();
  
  const baseClasses = "flex items-center justify-between py-2 px-4 rounded-md transition font-medium";
  const variants = {
    primary: darkMode 
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-blue-500 hover:bg-blue-600 text-white",
    secondary: darkMode 
      ? "bg-gray-700 hover:bg-gray-800 text-gray-200 border border-gray-600" 
      : "bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300",
    success: darkMode 
      ? "bg-green-700 hover:bg-green-800 text-white border border-green-600"
      : "bg-green-100 hover:bg-green-200 text-green-800 border border-green-300",
  };
  
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
      onClick={onClick}
      disabled={disabled}
    >
      <span>{text}</span>
      {Icon && <Icon size={18} />}
    </button>
  );
};

interface ContactActionProps {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
  href?: string;
  target?: string;
}

export const ContactAction: React.FC<ContactActionProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  href, 
  target 
}) => {
  const { darkMode } = useTheme();
  
  if (!value) return null;
  
  const isLink = href && href !== '#';
  const Component = isLink ? 'a' : 'div';
  const iconColor = '#0070d1'; // PS5_BLUE

  return (
    <Component
      href={isLink ? href : undefined}
      target={isLink ? target || '_self' : undefined}
      className={`flex items-center p-2.5 rounded-md transition group ${
        isLink ? (darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100') + ' cursor-pointer' : ''
      }`}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
    >
      <Icon size={20} style={{ color: iconColor }} className="mr-4 flex-shrink-0 opacity-80 group-hover:opacity-100" />
      <div className="flex-1">
        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} block`}>{label}</span>
        <span className={`${darkMode ? 'text-gray-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} ${isLink ? 'group-hover:underline' : ''}`}>{value}</span>
      </div>
    </Component>
  );
};

interface EditableFieldProps {
  icon: React.ElementType;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
}

export const EditableField: React.FC<EditableFieldProps> = ({ 
  icon: Icon, 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  type = 'text' 
}) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`flex items-center gap-3 p-2 ${darkMode ? 'border-gray-700 hover:bg-gray-800 focus-within:bg-gray-800' : 'border-gray-200 hover:bg-gray-100 focus-within:bg-gray-100'} border-b`}>
      <Icon size={20} style={{ color: '#0070d1' }} className="flex-shrink-0 opacity-80" />
      <div className="flex-1">
        <label htmlFor={name} className={`block text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-0.5`}>
          {label}
        </label>
        <input
          type={type}
          id={name}
          name={name}
          value={value || ''}
          onChange={onChange}
          className={`w-full p-1 border-none focus:ring-0 bg-transparent ${darkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}`}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

interface DetailItemProps {
  label: string;
  value: string | null | undefined;
  capitalize?: boolean;
  isLink?: boolean;
  href?: string;
}

export const DetailItem: React.FC<DetailItemProps> = ({ 
  label, 
  value, 
  capitalize = false, 
  isLink = false, 
  href = '#' 
}) => {
  const { darkMode } = useTheme();
  
  if (!value) return null;
  
  return (
    <div className={`flex items-start py-2 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} w-24 flex-shrink-0`}>
        {label}
      </span>
      {isLink ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-words">
          {value}
        </a>
      ) : (
        <span className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} break-words ${capitalize ? 'capitalize' : ''}`}>
          {value}
        </span>
      )}
    </div>
  );
};
