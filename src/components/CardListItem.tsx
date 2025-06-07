import React, { useState } from 'react';
import { Star, Trash2 } from '../utils/icons';
import { Card } from '../types';
import ConfirmationDialog from './ConfirmationDialog'; // Import ConfirmationDialog
import { PS5_BLUE } from '../utils/constants';
import { PlaceholderAvatar, PlaceholderLogo } from './PlaceholderElements';
import { useTheme } from '../context/ThemeContext';

interface CardListItemProps {
  card: Card;
  onClick: (card: Card) => void;
  onDelete: (id: number) => void;
}

const CardListItem: React.FC<CardListItemProps> = ({ card, onClick, onDelete }) => {
  const { darkMode } = useTheme();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // State to control visibility of the delete confirmation dialog

  // Opens the delete confirmation dialog
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick for the card itself
    setShowConfirmDialog(true); // Set state to show the dialog
  };

  // Called when deletion is confirmed from the dialog
  const handleConfirmDelete = () => {
    onDelete(card.id); // Execute the actual delete operation
    setShowConfirmDialog(false); // Close the dialog
  };

  // Called when deletion is cancelled from the dialog
  const handleCancelDelete = () => {
    setShowConfirmDialog(false); // Close the dialog
  };

  return (
    <> {/* Fragment to wrap CardListItem and ConfirmationDialog */}
      <div
        className={`rounded-lg shadow-md overflow-hidden transition-all duration-200 ease-out cursor-pointer ${
        darkMode 
          ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
          : 'bg-white border border-gray-200 hover:border-gray-300'
      } hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        darkMode ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'
      } focus:ring-blue-500 ${card.isMyCard ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
      onClick={() => onClick(card)}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${card.name}`}
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(card)}
      style={{ minHeight: '280px' }}
    >
      <div className="relative h-full flex flex-col">
        {/* Card header with color */}
        <div className="p-4 flex-none" style={{ 
          backgroundColor: card.color, 
          backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.3) 100%)`,
          height: '140px'
        }}>
          {/* Delete button */}
          <button
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 text-white transition-colors z-10 focus:outline-none focus:ring-1 focus:ring-white"
            onClick={handleDeleteClick} // Use new handler
            aria-label={`Delete ${card.name}`}
          >
            <Trash2 size={16} />
          </button>

          {/* Centered avatar/photo */}
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
              <PlaceholderAvatar name={card.name} size={80} themeColor="white" />
            </div>
          </div>
        </div>

        {/* Card body - Just name, position and company */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 flex-grow flex flex-col items-center`}>
          <div className="text-center">
            <h3 className={`font-semibold text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {card.name}
              {card.isMyCard && <Star size={12} className="inline ml-1 fill-current" style={{ color: PS5_BLUE }} />}
            </h3>
            {card.position && (
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                {card.position}
              </p>
            )}
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-1`}>
              {card.company}
            </p>
          </div>
        </div>

        {/* Card footer with logo */}
        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 flex-none flex justify-center items-center`}>
          <div className="bg-white p-1.5 rounded shadow-sm">
            <PlaceholderLogo company={card.company} color={card.color} width={60} height={30} themeColor={card.color}/>
          </div>
        </div>
      </div>
    </div>

    {/* Confirmation Dialog for Deletion */}
    {showConfirmDialog && (
      <ConfirmationDialog
        isOpen={showConfirmDialog}
        title="Confirm Deletion"
        message={
          <>
            Are you sure you want to delete the card "<strong>{card.name}</strong>"?
            This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
      />
    )}
    </>
  );
};

export default CardListItem;