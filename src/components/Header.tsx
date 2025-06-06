import React from 'react';
import { 
  WalletCards, CheckCircle, AlertCircle, Info, RefreshCw
} from '../utils/icons';

import { useTheme } from '../context/ThemeContext';

// HeaderProps removed as no props are needed after simplification
// interface HeaderProps {}

const Header: React.FC = () => {
  const { darkMode } = useTheme();

  return (
    <header className={`${darkMode ? 'bg-gray-900' : 'bg-white'} shadow-md sticky top-0 z-30 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex justify-between items-center px-4 py-3">
        <h1 className={`text-2xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <WalletCards size={28} className="text-blue-600" />
          Wallet
        </h1>
      </div>

      {/* No search input here anymore - moved to bottom SearchBar */}

    </header>
  );
};

export default Header;