import React, { useRef, useState, useId } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  description?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  onBlur?: () => void;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  name,
  checked,
  onChange,
  className = '',
  disabled = false,
  description,
  required = false,
  error,
  helpText,
  onBlur,
}) => {
  const { darkMode } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const checkboxRef = useRef<HTMLInputElement>(null);
  
  // Generate unique and stable IDs for accessibility
  const uniqueId = useId();
  const id = `checkbox-${name}-${uniqueId}`;
  const descriptionId = description ? `${id}-description` : undefined;
  const helpTextId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  
  // Handle keyboard interaction for the checkbox wrapper
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled && checkboxRef.current) {
        // Create a synthetic change event
        const syntheticEvent = {
          target: { ...checkboxRef.current, checked: !checked, name },
          currentTarget: { ...checkboxRef.current, checked: !checked, name },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
      }
    }
  };
  
  // Combine all describedby IDs
  const getAriaDescribedBy = () => {
    const ids = [];
    if (descriptionId) ids.push(descriptionId);
    if (helpTextId) ids.push(helpTextId);
    if (errorId) ids.push(errorId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  };

  return (
    <div className={`mb-4 ${className}`}>
      <div 
        className={`relative flex items-start ${
          error ? 'has-error' : ''
        }`}
        role="group"
        tabIndex={disabled ? undefined : 0}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          if (onBlur) onBlur();
        }}
        aria-invalid={!!error}
      >
        <div className="flex items-center h-5">
          <input
            ref={checkboxRef}
            id={id}
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            aria-describedby={getAriaDescribedBy()}
            aria-required={required}
            aria-invalid={!!error}
            required={required}
            className={`h-5 w-5 ${
              disabled ? 'opacity-60 cursor-not-allowed ' : ''
            }${
              error ? 'border-red-500 ' : ''
            }${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-blue-500' 
                : 'bg-gray-100 border-gray-300 text-blue-600'
            } rounded focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          />
        </div>
        <div className="ml-2">
          <label 
            htmlFor={id} 
            className={`${darkMode ? 'text-gray-200' : 'text-gray-700'} text-sm font-medium ${
              disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            } ${isFocused ? 'text-blue-500' : ''}`}
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
            {required && <span className="sr-only">(required)</span>}
          </label>
          
          {description && (
            <p 
              id={descriptionId} 
              className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {description}
            </p>
          )}
          
          {helpText && (
            <p 
              id={helpTextId} 
              className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {helpText}
            </p>
          )}
          
          {error && (
            <p 
              id={errorId} 
              className="mt-1 text-sm text-red-500" 
              aria-live="assertive"
            >
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckboxField;
