import React from 'react';
import { Search, X, SortAsc, Building, UserRound } from '../utils/icons';
import { useTheme } from '../context/ThemeContext';
import { SortOption } from '../hooks/useCards';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  sortBy: SortOption;
  onSortChange: (option: SortOption) => void;
  showSearch: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  sortBy,
  onSortChange,
  showSearch
}) => {
  const { darkMode } = useTheme();

  if (!showSearch) return null;

  return (
    <div className={`fixed bottom-16 left-0 right-0 z-20 ${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} px-4 py-3 space-y-2`}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search cards..."
          className={`w-full p-2 pl-10 border rounded-md ${
            darkMode 
              ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
              : 'border-gray-300 bg-white text-gray-800 placeholder-gray-500'
          } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
          autoFocus
        />
        <Search className={`absolute left-3 top-2.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
        {searchTerm && (
          <button
            className={`absolute right-3 top-2.5 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={onClearSearch}
            aria-label="Clear Search"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      {/* Sorting controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <SortAsc size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
          <span className={`ml-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sort by:</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onSortChange('name')}
            className={`flex items-center px-2 py-1 text-xs rounded-md transition-colors ${sortBy === 'name' 
              ? (darkMode ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800')
              : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
          >
            <UserRound size={14} className="mr-1" />
            Name
          </button>
          <button
            onClick={() => onSortChange('company')}
            className={`flex items-center px-2 py-1 text-xs rounded-md transition-colors ${sortBy === 'company' 
              ? (darkMode ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-800')
              : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
          >
            <Building size={14} className="mr-1" />
            Company
          </button>
          {sortBy !== 'none' && (
            <button
              onClick={() => onSortChange('none')}
              className={`flex items-center px-2 py-1 text-xs rounded-md transition-colors ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              <X size={14} className="mr-1" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
