import React, { useState, useRef, useEffect } from 'react';
import { X, Lock, Eye, EyeOff, AlertCircle } from '../utils/icons';
import { InputField } from './FormComponents';
import { UserData } from '../types';
import { PS5_BLUE } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthAction: () => void;
  isSignUp: boolean;
  onToggleMode: () => void;
  userData: UserData;
  onUserChange: (data: UserData) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthAction,
  isSignUp,
  onToggleMode,
  userData,
  onUserChange
}) => {
  const { darkMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Reset errors when form mode changes
  useEffect(() => {
    setErrors({});
  }, [isSignUp]);
  
  // Use our focus trap hook for accessibility
  useFocusTrap(
    isOpen,
    modalRef,
    isSignUp ? undefined : initialFocusRef,
    closeButtonRef,
    onClose
  );
  
  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onUserChange({ ...userData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(userData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!userData.password) {
      newErrors.password = 'Password is required';
    } else if (userData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(userData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(userData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }
    
    // Name validation (only for signup)
    if (isSignUp && !userData.name) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => { 
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Store auth state in localStorage
      localStorage.setItem('cardwallet_auth', JSON.stringify({
        isAuthenticated: true,
        user: {
          name: userData.name || 'User',
          email: userData.email
        },
        // In a real app, we would store a token here
        token: `sim_token_${Date.now()}`
      }));
      
      onAuthAction();
    } catch (error) {
      setErrors({ form: 'Authentication failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" 
      aria-modal="true" 
      role="dialog"
      aria-labelledby="auth-modal-title"
    >
      <form onSubmit={handleSubmit} className={`flex flex-col w-full max-w-md bg-${darkMode ? 'gray-900' : 'white'} rounded-lg overflow-hidden shadow-xl`} noValidate>
        <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
          <div className="flex justify-between items-center">
            <h2 id="auth-modal-title" className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
              onClick={onClose}
              ref={closeButtonRef}
            >
              <X size={24} />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Form-level error message */}
          {errors.form && (
            <div 
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 dark:bg-red-900 dark:border-red-800 dark:text-red-200"
              role="alert"
              aria-live="assertive"
            >
              <div className="flex items-center">
                <AlertCircle className="mr-2" size={16} />
                <span>{errors.form}</span>
              </div>
            </div>
          )}
          
          {isSignUp && (
            <div>
              <InputField 
                label="Full Name" 
                name="name" 
                value={userData.name || ''} 
                onChange={handleInputChange} 
                placeholder="Enter your name" 
                required 
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                ref={initialFocusRef}
              />
              {errors.name && (
                <p id="name-error" className="text-red-500 text-xs mt-1" aria-live="polite">{errors.name}</p>
              )}
            </div>
          )}
          
          <div>
            <InputField 
              label="Email" 
              name="email" 
              type="email" 
              value={userData.email || ''} 
              onChange={handleInputChange} 
              placeholder="Enter your email" 
              required 
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              ref={!isSignUp ? initialFocusRef : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-red-500 text-xs mt-1" aria-live="polite">{errors.email}</p>
            )}
          </div>
          
          <div>
            <div className="relative">
              <InputField 
                label="Password" 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                value={userData.password || ''} 
                onChange={handleInputChange} 
                placeholder="Enter your password" 
                required 
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility}
                className="absolute right-2 bottom-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-red-500 text-xs mt-1" aria-live="polite">{errors.password}</p>
            )}
          </div>

          <div className="flex items-start pt-2">
            <Lock size={16} className={`${darkMode ? 'text-gray-500' : 'text-gray-400'} mr-2 mt-0.5 flex-shrink-0`} />
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Your data is securely stored (Simulation).
            </p>
          </div>
        </div>

        <div className={`p-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'} border-t`}>
          <button
            type="submit"
            className={`w-full p-2.5 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'} focus:ring-blue-500 relative ${isSubmitting ? 'opacity-80' : ''}`}
            style={{ backgroundColor: PS5_BLUE }}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="opacity-0">{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              </>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
          <div className="mt-4 text-center">
            <button type="button" className="text-blue-400 hover:underline text-sm" onClick={onToggleMode}>
              {isSignUp ? 'Already have an account? Sign in' : 'New user? Create account'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AuthModal;