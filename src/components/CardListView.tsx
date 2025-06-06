import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Card, GroupedCards } from '../types';
import { CATEGORY_LABELS } from '../utils/constants';
import { Phone, Hash, Trash2 } from '../utils/icons';

interface CardListViewProps {
  groupedCards: GroupedCards;
  orderedCategories: string[];
  expandedCategory: string | null;
  onToggleCategory: (category: string) => void;
  onCardClick: (card: Card) => void;
  onCardDelete: (card: Card) => void;
  searchTerm: string;
}

const CardListView: React.FC<CardListViewProps> = ({
  groupedCards,
  orderedCategories,
  expandedCategory,
  onToggleCategory,
  onCardClick,
  onCardDelete,
  searchTerm
}) => {
  const { darkMode } = useTheme();

  const filterCards = (cards: Card[]) => {
    if (!searchTerm) return cards;
    
    return cards.filter(card => 
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className={`flex-1 overflow-auto px-4 py-2 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {orderedCategories.map(category => {
        const cards = filterCards(groupedCards[category]);
        if (cards.length === 0) return null;
        
        const categoryLabel = CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] || category;
        const isExpanded = expandedCategory === category;
        
        return (
          <div key={category} className="mb-4">
            <div 
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700' 
                  : 'bg-white hover:bg-gray-100'
              } shadow-sm mb-2`}
              onClick={() => onToggleCategory(category)}
            >
              <h2 className="text-lg font-semibold">{categoryLabel}</h2>
              <span className="text-sm px-2 py-0.5 rounded-full bg-blue-500 text-white">{cards.length}</span>
            </div>
            
            {isExpanded && (
              <div className={`rounded-md overflow-hidden shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <table className="w-full">
                  <thead>
                    <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <th className="text-left p-3">Name</th>
                      <th className="text-left p-3">Company</th>
                      <th className="text-left p-3">{category === 'business' ? 'Phone' : 'Identifier'}</th>
                      <th className="p-3 w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map(card => (
                      <tr 
                        key={card.id} 
                        className={`border-t ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'} cursor-pointer`}
                        onClick={(e) => {
                          // Prevent triggering when clicking the delete button
                          if ((e.target as HTMLElement).closest('button')) return;
                          onCardClick(card);
                        }}
                      >
                        <td className="p-3">{card.name}</td>
                        <td className="p-3">{card.company}</td>
                        <td className="p-3">
                          <div className="flex items-center">
                            {category === 'business' ? (
                              <>
                                <Phone size={16} className="mr-2 text-blue-500" />
                                {card.phone || 'N/A'}
                              </>
                            ) : category === 'mycard' ? (
                              <>
                                <Phone size={16} className="mr-2 text-blue-500" />
                                {card.phone || 'N/A'}
                              </>
                            ) : (
                              <>
                                <Hash size={16} className="mr-2 text-blue-500" />
                                {card.identifier || 'N/A'}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCardDelete(card);
                            }}
                            className={`p-1.5 rounded-full ${
                              darkMode 
                                ? 'bg-gray-700 hover:bg-red-900 text-gray-300 hover:text-red-300' 
                                : 'bg-gray-200 hover:bg-red-100 text-gray-600 hover:text-red-600'
                            }`}
                            aria-label="Delete card"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
      
      {orderedCategories.length === 0 && (
        <div className={`text-center py-10 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-lg">No cards found</p>
          {searchTerm && <p className="text-sm mt-2">Try a different search term</p>}
        </div>
      )}
    </div>
  );
};

export default CardListView;
