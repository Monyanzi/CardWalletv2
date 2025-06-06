import React, { useState, useRef } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, User, Mail, Lock } from '../utils/icons';
import { useTheme } from '../context/ThemeContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { PS5_BLUE } from '../utils/constants';

interface RegisterFormProps {
  onSubmit: (userData: { name: string; email: string; password: string }) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading, error }) => {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Use focus trap for accessibility
  useFocusTrap(true, formRef, nameInputRef);

  // Real-time validation
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (value.trim().length > 50) return 'Name must be less than 50 characters';
        return undefined;
        
      case 'email':
        if (!value.trim()) return 'Email address is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        return undefined;
        
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/(?=.*[a-zA-Z])/.test(value)) return 'Password must contain at least one letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        return undefined;
        
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return undefined;
        
      default:
        return undefined;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field
    const error = validateField(name, value);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
    
    // If confirming password, also revalidate confirm password field
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setValidationErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Check if form is valid
  const isFormValid = () => {
    const errors = Object.keys(formData).map(key => 
      validateField(key, formData[key as keyof typeof formData])
    );
    return errors.every(error => !error) && 
           Object.values(formData).every(value => value.trim() !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });
    
    // Validate all fields
    const errors: ValidationErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) errors[key as keyof ValidationErrors] = error;
    });
    
    setValidationErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
    }
  };

  const getFieldError = (fieldName: string) => {
    return touched[fieldName] ? validationErrors[fieldName as keyof ValidationErrors] : undefined;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return { strength, label: labels[Math.min(strength - 1, 4)] || '' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Global Error Message */}
      {error && (
        <div 
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-800 dark:text-red-200"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center">
            <AlertCircle className="mr-2\" size={16} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Full Name Field */}
      <div>
        <label htmlFor="name" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <input
            ref={nameInputRef}
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:border-transparent ${
              getFieldError('name')
                ? 'border-red-500 focus:ring-red-500'
                : darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500'
            }`}
            placeholder="Enter your full name"
            required
            aria-invalid={!!getFieldError('name')}
            aria-describedby={getFieldError('name') ? 'name-error' : undefined}
          />
        </div>
        {getFieldError('name') && (
          <p id="name-error" className="mt-1 text-sm text-red-500" aria-live="polite">
            {getFieldError('name')}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:border-transparent ${
              getFieldError('email')
                ? 'border-red-500 focus:ring-red-500'
                : darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500'
            }`}
            placeholder="Enter your email address"
            required
            aria-invalid={!!getFieldError('email')}
            aria-describedby={getFieldError('email') ? 'email-error' : undefined}
          />
        </div>
        {getFieldError('email') && (
          <p id="email-error" className="mt-1 text-sm text-red-500" aria-live="polite">
            {getFieldError('email')}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:border-transparent ${
              getFieldError('password')
                ? 'border-red-500 focus:ring-red-500'
                : darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500'
            }`}
            placeholder="Create a strong password"
            required
            aria-invalid={!!getFieldError('password')}
            aria-describedby={getFieldError('password') ? 'password-error password-strength' : 'password-strength'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <Eye className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </button>
        </div>
        
        {/* Password Strength Indicator */}
        {formData.password && (
          <div id="password-strength" className="mt-2">
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordStrength.strength <= 1 ? 'bg-red-500' :
                    passwordStrength.strength <= 2 ? 'bg-yellow-500' :
                    passwordStrength.strength <= 3 ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
              {passwordStrength.label && (
                <span className={`text-xs ${
                  passwordStrength.strength <= 1 ? 'text-red-500' :
                  passwordStrength.strength <= 2 ? 'text-yellow-500' :
                  passwordStrength.strength <= 3 ? 'text-blue-500' :
                  'text-green-500'
                }`}>
                  {passwordStrength.label}
                </span>
              )}
            </div>
          </div>
        )}
        
        {getFieldError('password') && (
          <p id="password-error" className="mt-1 text-sm text-red-500" aria-live="polite">
            {getFieldError('password')}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div>
        <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`w-full pl-10 pr-10 py-2 border rounded-md focus:ring-2 focus:border-transparent ${
              getFieldError('confirmPassword')
                ? 'border-red-500 focus:ring-red-500'
                : darkMode
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-blue-500'
            }`}
            placeholder="Confirm your password"
            required
            aria-invalid={!!getFieldError('confirmPassword')}
            aria-describedby={getFieldError('confirmPassword') ? 'confirm-password-error' : undefined}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirmPassword ? (
              <EyeOff className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            ) : (
              <Eye className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            )}
          </button>
        </div>
        {getFieldError('confirmPassword') && (
          <p id="confirm-password-error" className="mt-1 text-sm text-red-500" aria-live="polite">
            {getFieldError('confirmPassword')}
          </p>
        )}
        {formData.confirmPassword && !getFieldError('confirmPassword') && (
          <div className="mt-1 flex items-center text-green-500">
            <CheckCircle size={16} className="mr-1" />
            <span className="text-sm">Passwords match</span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid() || isLoading}
        className={`w-full py-2.5 px-4 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'
        } focus:ring-blue-500 relative ${
          !isFormValid() || isLoading
            ? 'opacity-50 cursor-not-allowed bg-gray-400'
            : 'text-white hover:opacity-90'
        }`}
        style={{ 
          backgroundColor: !isFormValid() || isLoading ? undefined : PS5_BLUE 
        }}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <span className="opacity-0">Create Account</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          </>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Password Requirements */}
      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} space-y-1`}>
        <p className="font-medium">Password requirements:</p>
        <ul className="space-y-1 ml-4">
          <li className="flex items-center">
            <span className={`mr-2 ${formData.password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`}>
              {formData.password.length >= 8 ? '✓' : '•'}
            </span>
            At least 8 characters
          </li>
          <li className="flex items-center">
            <span className={`mr-2 ${/(?=.*[a-zA-Z])/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`}>
              {/(?=.*[a-zA-Z])/.test(formData.password) ? '✓' : '•'}
            </span>
            At least one letter
          </li>
          <li className="flex items-center">
            <span className={`mr-2 ${/(?=.*\d)/.test(formData.password) ? 'text-green-500' : 'text-gray-400'}`}>
              {/(?=.*\d)/.test(formData.password) ? '✓' : '•'}
            </span>
            At least one number
          </li>
        </ul>
      </div>
    </form>
  );
};

export default RegisterForm;