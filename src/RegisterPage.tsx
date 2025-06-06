import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from './authService';
import { useAuth } from './AuthContext';
import { PS5_BLUE } from './utils/constants';
import { useTheme } from './context/ThemeContext';
import { WalletCards, ArrowLeft } from './utils/icons';
import RegisterForm from './components/RegisterForm';

const RegisterPage: React.FC = () => {
  const { darkMode } = useTheme();
  const auth = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (userData: { name: string; email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await registerUser(userData.email, userData.password);
      
      if (response.message && response.message.toLowerCase().includes('success')) {
        // Registration successful, now log the user in automatically
        try {
          const { loginUser } = await import('./authService');
          const loginResponse = await loginUser(userData.email, userData.password);
          
          if (loginResponse.token && loginResponse.userId && loginResponse.email) {
            // Auto-login successful
            auth.login(loginResponse.token, loginResponse.userId, loginResponse.email);
            
            // Navigate to main app (seamless onboarding)
            navigate('/', { replace: true });
          } else {
            // Registration successful but auto-login failed, redirect to login
            navigate('/login', { 
              state: { 
                message: 'Account created successfully! Please sign in with your new credentials.',
                email: userData.email 
              }
            });
          }
        } catch (loginError) {
          // Auto-login failed, redirect to login page with success message
          navigate('/login', { 
            state: { 
              message: 'Account created successfully! Please sign in with your new credentials.',
              email: userData.email 
            }
          });
        }
      } else {
        // Registration failed
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      darkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <div className={`max-w-md w-full space-y-8 p-8 sm:p-10 shadow-xl rounded-lg ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <WalletCards size={32} style={{ color: PS5_BLUE }} />
            <h1 className="ml-2 text-3xl font-bold" style={{ color: PS5_BLUE }}>
              CardWallet
            </h1>
          </div>
          <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Create your account
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Join thousands of users organizing their digital cards
          </p>
        </div>

        {/* Registration Form */}
        <RegisterForm 
          onSubmit={handleRegister}
          isLoading={isLoading}
          error={error}
        />

        {/* Navigation Links */}
        <div className={`text-center space-y-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-medium hover:underline transition-colors"
              style={{ color: PS5_BLUE }}
            >
              Sign in
            </Link>
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Or{' '}
            <Link 
              to="/" 
              className="font-medium hover:underline transition-colors inline-flex items-center"
              style={{ color: PS5_BLUE }}
            >
              <ArrowLeft size={14} className="mr-1" />
              continue as guest
            </Link>
          </p>
        </div>

        {/* Security Notice */}
        <div className={`text-xs text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'} space-y-1`}>
          <p>By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
          <p>Your data is encrypted and securely stored.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;