import React, { ReactNode } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  className = '',
  type = 'button',
  fullWidth = false,
  style,
}) => {
  const { darkMode } = useTheme();
  
  const baseClasses = 'rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: `bg-blue-600 hover:bg-blue-700 text-white ${darkMode ? 'focus:ring-blue-800' : 'focus:ring-blue-500'}`,
    secondary: `${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-300'}`,
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };
  
  const widthClasses = fullWidth ? 'w-full' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${widthClasses} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;
