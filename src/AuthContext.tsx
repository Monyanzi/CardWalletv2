import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

interface AuthState {
  token: string | null;
  userId: number | null;
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, userId: number, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    userId: null,
    email: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('authUserId');
    const storedEmail = localStorage.getItem('authUserEmail');

    if (storedToken && storedUserId && storedEmail) {
      setAuthState({
        token: storedToken,
        userId: parseInt(storedUserId, 10),
        email: storedEmail,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = (token: string, userId: number, email: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUserId', userId.toString());
    localStorage.setItem('authUserEmail', email);
    setAuthState({
      token,
      userId,
      email,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUserId');
    localStorage.removeItem('authUserEmail');
    setAuthState({
      token: null,
      userId: null,
      email: null,
      isAuthenticated: false,
      isLoading: false,
    });
    // Optionally, redirect to login page or home page
    // window.location.href = '/login'; 
  };

  const contextValue = useMemo(() => ({
    ...authState,
    login,
    logout,
  }), [authState, login, logout]); // login and logout are stable

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
