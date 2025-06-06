import { useState, useCallback } from 'react';

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);
  
  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);
  
  const handleSearchToggle = useCallback(() => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      setSearchTerm('');
    }
  }, [showSearch]);
  
  return {
    searchTerm,
    showSearch,
    handleSearchChange,
    handleClearSearch,
    handleSearchToggle
  };
};
