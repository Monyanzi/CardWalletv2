import React, { useState, useEffect, useRef, useId } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SelectOption } from '../../types';

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validate?: (value: string) => string | null;
  touchedOnChange?: boolean;
  helpText?: string;
  className?: string;
  hideLabel?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  validate,
  touchedOnChange = true,
  helpText,
  className = '',
  hideLabel = false,
}) => {
  const { darkMode } = useTheme();
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  
  // Generate unique IDs for accessibility
  const uniqueId = useId();
  const selectId = `${name}-${uniqueId}`;
  const helpTextId = `${selectId}-help`;
  const errorId = `${selectId}-error`;
  
  // Validate select value
  useEffect(() => {
    if (!touched) return;
    
    // Don't validate disabled fields
    if (disabled) {
      setError(null);
      return;
    }
    
    // Required field validation
    if (required && !value) {
      setError(`${label} is required`);
      return;
    }
    
    // Skip further validation if empty and not required
    if (!value) {
      setError(null);
      return;
    }
    
    // Custom validation if provided
    if (validate) {
      const customError = validate(value);
      if (customError) {
        setError(customError);
        return;
      }
    }
    
    setError(null);
  }, [value, touched, required, label, validate, disabled]);
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (touchedOnChange && !touched) {
      setTouched(true);
    }
    onChange(e);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    if (!touched) {
      setTouched(true);
    }
  };
  
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  // For screen readers, prepare announcements about constraints
  const getAriaDescribedBy = () => {
    const ids = [];
    
    if (helpText) ids.push(helpTextId);
    if (touched && error) ids.push(errorId);
    
    return ids.length > 0 ? ids.join(' ') : undefined;
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={selectId} 
        className={`block text-sm font-medium mb-1 ${hideLabel ? 'sr-only' : ''} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        )}
        {required && <span className="sr-only">(required)</span>}
      </label>
      <div className="relative">
        <select
          ref={selectRef}
          id={selectId}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={getAriaDescribedBy()}
          className={`w-full p-2 rounded-md appearance-none ${
            darkMode 
              ? 'bg-gray-700 text-white' 
              : 'bg-white text-gray-900'
          } border ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : isFocused 
                ? 'border-blue-500' 
                : darkMode ? 'border-gray-600' : 'border-gray-300'
          } focus:outline-none focus:ring-2 ${
            darkMode ? 'focus:ring-blue-600' : 'focus:ring-blue-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <div 
          className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2"
          aria-hidden="true"
        >
          <svg
            className={`h-4 w-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      
      {/* Help text always visible */}
      {helpText && (
        <div 
          id={helpTextId}
          className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {helpText}
        </div>
      )}
      
      {/* Error message */}
      {touched && error && (
        <div 
          id={errorId} 
          className="mt-1 text-sm text-red-500" 
          aria-live="assertive"
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default SelectField;
