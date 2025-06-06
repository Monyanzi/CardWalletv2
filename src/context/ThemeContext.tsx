import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type ThemeContextType = {
  darkMode: boolean;
  toggleTheme: () => void;
  listView: boolean;
  toggleViewMode: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or use system preference as fallback
  const getInitialDarkMode = (): boolean => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('cardwallet_theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    }
    
    // Fall back to system preference
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  
  const getInitialListView = (): boolean => {
    const savedView = localStorage.getItem('cardwallet_view');
    return savedView !== null ? savedView === 'list' : false;
  };
  
  const [darkMode, setDarkMode] = useState(getInitialDarkMode());
  const [listView, setListView] = useState(getInitialListView());

  const toggleTheme = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('cardwallet_theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };
  
  const toggleViewMode = () => {
    setListView(prev => {
      const newView = !prev;
      localStorage.setItem('cardwallet_view', newView ? 'list' : 'grid');
      return newView;
    });
  };
  
  // Apply theme to document body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  // Listen for system preference changes
  useEffect(() => {
    // Only apply this if user hasn't explicitly set a preference
    if (localStorage.getItem('cardwallet_theme') === null) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setDarkMode(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, listView, toggleViewMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};