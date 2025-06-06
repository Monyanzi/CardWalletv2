import React from 'react';
import { 
  User, Search, Plus, Sun, Moon, 
  List, Grid
} from '../utils/icons';
import { PS5_BLUE } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';
import { SortOption } from '../hooks/useCards';

interface FooterProps {
  // isAuth removed as it's no longer used in Footer logic
  onUserClick: () => void;
  onSearchToggle: () => void;
  onAddClick: () => void;
  showSearch: boolean;
  sortBy: SortOption;
}

const Footer: React.FC<FooterProps> = ({
  onUserClick,
  onSearchToggle,
  onAddClick
}) => {
  const { darkMode, toggleTheme, listView, toggleViewMode } = useTheme();

  return (
    <footer className={`${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-lg fixed bottom-0 left-0 right-0 z-30 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex justify-between items-center px-2 py-2">
        <button
          className={`flex flex-col items-center justify-center p-2 rounded-md ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors focus:outline-none`}
          onClick={onSearchToggle}
          aria-label="Search"
        >
          <Search size={20} />
          <span className="text-xs mt-1">Search</span>
        </button>
        
        <button
          className={`flex flex-col items-center justify-center p-2 rounded-md ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors focus:outline-none`}
          onClick={toggleViewMode}
          aria-label={listView ? "Grid View" : "List View"}
        >
          {listView ? <Grid size={20} /> : <List size={20} />}
          <span className="text-xs mt-1">View</span>
        </button>
        
        <button
          className={`flex flex-col items-center justify-center p-2 rounded-full -mt-6 text-white transition-colors focus:outline-none`}
          style={{ backgroundColor: PS5_BLUE }}
          onClick={onAddClick}
          aria-label="Add Card"
        >
          <Plus size={24} />
        </button>
        
        <button
          className={`flex flex-col items-center justify-center p-2 rounded-md ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors focus:outline-none`}
          onClick={toggleTheme}
          aria-label={darkMode ? "Light Mode" : "Dark Mode"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span className="text-xs mt-1">Theme</span>
        </button>
        
        <button
          className={`flex flex-col items-center justify-center p-2 rounded-md ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors focus:outline-none`}
          onClick={onUserClick}
          aria-label="Profile"
        >
          <User size={20} />
          <span className="text-xs mt-1">Profile</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
