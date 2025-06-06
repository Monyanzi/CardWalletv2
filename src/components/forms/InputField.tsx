import React, { useState, useEffect, useRef, useId } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  validate?: (value: string) => string | null;
  touchedOnChange?: boolean;
  helpText?: string;
  autoComplete?: string;
  className?: string;
  hideLabel?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  required = false,
  disabled = false,
  pattern,
  minLength,
  maxLength,
  validate,
  touchedOnChange = true,
  helpText,
  autoComplete,
  className = '',
  hideLabel = false,
}) => {
  const { darkMode } = useTheme();
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Generate unique IDs for accessibility
  const uniqueId = useId();
  const inputId = `${name}-${uniqueId}`;
  const helpTextId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  
  // Validate the field whenever value changes or when touched
  useEffect(() => {
    if (!touched && value === '') return;
    
    // Don't validate disabled fields
    if (disabled) {
      setError(null);
      return;
    }

    // Required field validation
    if (required && (!value || value.trim() === '')) {
      setError(`${label} is required`);
      return;
    }
    
    // Skip further validation if empty and not required
    if (!value || value.trim() === '') {
      setError(null);
      return;
    }
    
    // Email validation
    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // URL validation
    if (type === 'url' && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/.test(value)) {
      setError('Please enter a valid URL');
      return;
    }
    
    // Phone number validation
    if ((type === 'tel' || name.includes('phone') || name.includes('mobile')) && 
        !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number');
      return;
    }
    
    // Min/max length validation
    if (minLength && value.length < minLength) {
      setError(`${label} must be at least ${minLength} characters`);
      return;
    }
    
    if (maxLength && value.length > maxLength) {
      setError(`${label} must not exceed ${maxLength} characters`);
      return;
    }
    
    // Pattern validation if provided
    if (pattern && !new RegExp(pattern).test(value)) {
      setError(`Please enter a valid ${label.toLowerCase()}`);
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
    
    // If we get here, validation passed
    setError(null);
  }, [value, touched, required, type, label, pattern, minLength, maxLength, validate, disabled]);
  
  // Custom onChange handler to mark field as touched
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  
  // Function to clear the input and reset states
  const clearInput = () => {
    const syntheticEvent = {
      target: { value: '', name },
      currentTarget: { value: '', name },
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
    inputRef.current?.focus();
  };
  
  // For screen readers, prepare announcements about required fields and constraints
  const getAriaDescribedBy = () => {
    const ids = [];
    
    if (helpText) ids.push(helpTextId);
    if (touched && error) ids.push(errorId);
    
    return ids.length > 0 ? ids.join(' ') : undefined;
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={inputId} 
        className={`block text-sm font-medium mb-1 ${hideLabel ? 'sr-only' : ''} ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">*</span>
        )}
        {required && <span className="sr-only">(required)</span>}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          id={inputId}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
          autoComplete={autoComplete}
          spellCheck={type === 'email' || type === 'text'}
          aria-invalid={!!error}
          aria-required={required}
          aria-describedby={getAriaDescribedBy()}
          className={`w-full p-2 rounded-md ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
          } border focus:outline-none focus:ring-2 ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : isFocused 
                ? 'border-blue-500' 
                : 'border-gray-300'
          } ${
            darkMode 
              ? 'focus:ring-blue-600' 
              : 'focus:ring-blue-500'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
            value && type !== 'date' && type !== 'time' ? 'pr-10' : ''
          }`}
        />
        
        {/* Clear button only shown for non-empty fields that aren't disabled */}
        {value && !disabled && type !== 'date' && type !== 'time' && (
          <button
            type="button"
            onClick={clearInput}
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            aria-label={`Clear ${label} input`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
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


export default InputField;
