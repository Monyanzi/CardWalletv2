import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from './authService';
import { useAuth } from './AuthContext';
import { PS5_BLUE } from './utils/constants'; // Assuming constants.ts is in src/utils

const LoginPage: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Login attempt with:', { email, password });
    try {
      const data = await loginUser(email, password);
      if (data.token && data.userId && data.email) {
        console.log('Login successful, token:', data.token, 'userId:', data.userId, 'email:', data.email);
        auth.login(data.token, data.userId, data.email);
        alert('Login Successful!'); // User will be redirected
        navigate('/'); // Redirect to the main app page
      } else if (data.token && (!data.userId || !data.email)) {
        // Handle case where token is present but userId or email is missing
        console.error('Login successful but missing userId or email in response:', data);
        alert('Login Error: Incomplete user data received from server.');
      } else {
        console.error('Login failed:', data.message);
        alert('Login Failed: ' + data.message);
      }
    } catch (error: any) {
      console.error('An unexpected error occurred during login:', error);
      alert('Login Error: ' + (error.message || 'An unexpected error occurred.'));
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 sm:p-10 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        <div>
          <h1 className="text-center text-4xl font-bold" style={{ color: PS5_BLUE }}>
            CardWallet
          </h1>
          <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm flex flex-col space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 dark:focus:ring-offset-gray-800 transition-colors duration-150"
              style={{ backgroundColor: PS5_BLUE, boxShadow: `0 2px 10px -3px ${PS5_BLUE}` }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#005bb5' } // Darken PS5_BLUE on hover
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = PS5_BLUE }
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium hover:underline" style={{ color: PS5_BLUE }}>
              Sign up
            </Link>
          </p>
          <p className="mt-2">
            Or{' '}
            <Link to="/" className="font-medium hover:underline" style={{ color: PS5_BLUE }}>
              continue as guest
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
