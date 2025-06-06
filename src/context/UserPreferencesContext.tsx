import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define all user preferences that should be persisted
interface UserPreferences {
  sortBy: string;
  lastExpandedCategory: string | null;
  searchTerm: string;
  showSearch: boolean;
}

interface UserPreferencesContextType extends UserPreferences {
  setSortPreference: (value: string) => void;
  setExpandedCategory: (category: string | null) => void;
  setSearchTerm: (term: string) => void;
  setShowSearch: (show: boolean) => void;
  resetPreferences: () => void;
}

// Default preferences when nothing is stored
const DEFAULT_PREFERENCES: UserPreferences = {
  sortBy: 'name',
  lastExpandedCategory: null,
  searchTerm: '',
  showSearch: false,
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or use defaults
  const getInitialPreferences = (): UserPreferences => {
    try {
      const savedPrefs = localStorage.getItem('cardwallet_preferences');
      if (savedPrefs) {
        const parsedPrefs = JSON.parse(savedPrefs);
        return {
          ...DEFAULT_PREFERENCES,
          ...parsedPrefs,
        };
      }
    } catch (error) {
      console.error('Error loading preferences from localStorage:', error);
    }
    return DEFAULT_PREFERENCES;
  };
  
  const [preferences, setPreferences] = useState<UserPreferences>(getInitialPreferences);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cardwallet_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences to localStorage:', error);
    }
  }, [preferences]);

  // Preference update functions
  const setSortPreference = (value: string) => {
    setPreferences(prev => ({ ...prev, sortBy: value }));
  };
  
  const setExpandedCategory = (category: string | null) => {
    setPreferences(prev => ({ ...prev, lastExpandedCategory: category }));
  };
  
  const setSearchTerm = (term: string) => {
    setPreferences(prev => ({ ...prev, searchTerm: term }));
  };
  
  const setShowSearch = (show: boolean) => {
    setPreferences(prev => ({ ...prev, showSearch: show }));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return (
    <UserPreferencesContext.Provider 
      value={{ 
        ...preferences, 
        setSortPreference, 
        setExpandedCategory,
        setSearchTerm,
        setShowSearch,
        resetPreferences
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = (): UserPreferencesContextType => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
