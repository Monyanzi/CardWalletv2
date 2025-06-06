import React, { useState } from 'react';
import { ChevronDown, Star, WalletCards, Plus } from '../utils/icons';
import CardListItem from './CardListItem';
import { Card, GroupedCards } from '../types';
import { CATEGORY_LABELS, PS5_BLUE } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';

interface CardListProps {
  groupedCards: GroupedCards;
  orderedCategories: string[];
  expandedCategory: string | null;
  onToggleCategory: (category: string) => void;
  onCardClick: (card: Card) => void;
  onCardDelete: (id: number) => void;
  searchTerm: string;
}

const CardList: React.FC<CardListProps> = ({
  groupedCards,
  orderedCategories,
  expandedCategory,
  onToggleCategory,
  onCardClick,
  onCardDelete,
  searchTerm
}) => {
  const { darkMode } = useTheme();
  
  // State to track which categories have their "show more" expanded
  const [expandedShowMore, setExpandedShowMore] = useState<Record<string, boolean>>({});
  
  // Number of rows to show initially
  const INITIAL_ROWS = 3;
  const CARDS_PER_ROW = 3;
  const INITIAL_CARDS = INITIAL_ROWS * CARDS_PER_ROW;
  
  // Toggle "show more" for a category
  const toggleShowMore = (category: string) => {
    setExpandedShowMore(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getSortedCards = (cards: Card[]) => {
    // Sort cards by last name
    return [...cards].sort((a, b) => {
      const aLastName = a.name.split(' ').slice(-1)[0];
      const bLastName = b.name.split(' ').slice(-1)[0];
      return aLastName.localeCompare(bLastName);
    });
  };

  return (
    <main className={`flex-1 overflow-y-auto px-4 py-4 space-y-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {orderedCategories.length > 0 ? (
        orderedCategories.map(category => {
          // Filter cards based on search and then sort by last name
          const categoryCards = getSortedCards(
            groupedCards[category].filter(card =>
              searchTerm === '' ||
              card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              card.company.toLowerCase().includes(searchTerm.toLowerCase())
            )
          );

          if (categoryCards.length === 0) return null;

          // Determine how many cards to display
          const showAllCards = expandedShowMore[category] || categoryCards.length <= INITIAL_CARDS;
          const displayCards = showAllCards ? categoryCards : categoryCards.slice(0, INITIAL_CARDS);
          const hasMoreCards = categoryCards.length > INITIAL_CARDS;

          return (
            <div key={category} className="space-y-3">
              {/* Category Header */}
              <button
                className="flex justify-between items-center px-1 cursor-pointer w-full text-left group"
                onClick={() => onToggleCategory(category)}
                aria-expanded={expandedCategory === category}
                aria-controls={`category-${category}`}
              >
                <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} flex items-center gap-1.5`}>
                  {category === 'mycard' && <Star size={16} className="fill-current" style={{ color: PS5_BLUE }} />}
                  <span className="font-medium">
                    {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category}
                  </span>
                  <span className={`text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'} ml-1`}>({categoryCards.length})</span>
                </h2>
                <ChevronDown
                  size={20}
                  className={`${darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-700'} transition-transform duration-200 ${expandedCategory === category ? 'transform rotate-180' : ''}`}
                />
              </button>

              {/* Cards Grid - Exactly 3 columns */}
              {expandedCategory === category && (
                <div className="space-y-4">
                  <div
                    id={`category-${category}`}
                    className="pt-2 px-1 pb-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                  >
                    {displayCards.map((card) => (
                      <CardListItem
                        key={card.id}
                        card={card}
                        onClick={onCardClick}
                        onDelete={onCardDelete}
                      />
                    ))}
                  </div>
                  
                  {/* Show More/Less Button */}
                  {hasMoreCards && (
                    <div className="flex justify-center">
                      <button 
                        onClick={() => toggleShowMore(category)}
                        className={`px-4 py-1.5 rounded-full flex items-center gap-1 ${
                          darkMode 
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } transition-colors`}
                      >
                        <span>{expandedShowMore[category] ? 'Show Less' : `Show More (${categoryCards.length - INITIAL_CARDS})`}</span>
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform ${expandedShowMore[category] ? 'transform rotate-180' : ''}`} 
                        />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : (
        // Empty State
        <div className="text-center py-10">
          <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
            {searchTerm ? 'No cards match your search.' : 'Your wallet is empty.'}
          </p>
          {!searchTerm && <WalletCards size={48} className={`mx-auto mt-4 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />}
           <button
              className="mt-4 px-4 py-2 rounded-md text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 flex items-center gap-2 mx-auto"
              style={{ backgroundColor: PS5_BLUE }}
            >
              <Plus size={18} /> Add Your First Card
            </button>
        </div>
      )}
    </main>
  );
};

export default CardList;