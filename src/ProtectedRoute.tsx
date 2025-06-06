import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  // We can pass an element prop if we want to wrap a specific component directly
  // element?: React.ReactElement;
  // Or use Outlet for nested routes, which is more common for layout components
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You can render a loading spinner or a blank page while checking auth status
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-500"></div>
          </div>
          <p className="text-gray-700 dark:text-gray-300">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />; // Renders the child route's element if authenticated
  // If using element prop: return element || <Outlet />;
};

export default ProtectedRoute;
