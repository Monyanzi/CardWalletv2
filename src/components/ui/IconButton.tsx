import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import type { LucideProps } from '../../utils/icons';

interface IconButtonProps {
  icon: React.FC<LucideProps>;
  onClick?: () => void;
  label?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  label,
  variant = 'primary',
  size = 'md',
  className = '',
}) => {
  const { darkMode } = useTheme();
  
  const sizeClasses = {
    sm: 'p-1.5 rounded-md',
    md: 'p-2 rounded-md',
    lg: 'p-3 rounded-lg',
  };
  
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };
  
  const variantClasses = {
    primary: `bg-blue-600 text-white hover:bg-blue-700 ${darkMode ? 'focus:ring-blue-800' : 'focus:ring-blue-500'}`,
    secondary: `${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`,
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  
  return (
    <button
      className={`${sizeClasses[size]} ${variantClasses[variant]} transition-colors focus:outline-none focus:ring-2 ${className}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Icon size={iconSizes[size]} />
    </button>
  );
};

export default IconButton;
