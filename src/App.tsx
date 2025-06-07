import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary'; // Import ErrorBoundary
import { AuthProvider } from './AuthContext'; // Import AuthProvider
import { UserPreferencesProvider } from './context/UserPreferencesContext';

// Lazy load the main component for better performance
const CardWallet = lazy(() => import('./components/OptimizedCardWallet'));
const LoginPage = lazy(() => import('./LoginPage')); // Assuming LoginPage.tsx is in src/
const RegisterPage = lazy(() => import('./RegisterPage')); // Assuming RegisterPage.tsx is in src/
// const ProtectedRoute = lazy(() => import('./ProtectedRoute')); // ProtectedRoute might no longer be needed if all main routes are public

function App() {
  return (
    <ThemeProvider>
      <UserPreferencesProvider>
        <AuthProvider>
          <Router>
          <Suspense fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-blue-500"></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">Loading Card Wallet...</p>
          </div>
        </div>
      }>
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* CardWallet is now accessible to everyone */}
                <Route path="/*" element={<CardWallet />} />
              </Routes>
            </ErrorBoundary>
          </Suspense>
          </Router>
        </AuthProvider>
      </UserPreferencesProvider>
    </ThemeProvider>
  );
}

export default App;