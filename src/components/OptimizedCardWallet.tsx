import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useAuth } from '../AuthContext';
import { deleteAccount } from '../authService'; // Added for account deletion
import { useNavigate } from 'react-router-dom';
import { LogOut, Trash2 } from '../utils/icons'; // Added Trash2 for delete icon
import { INITIAL_CARD_STATE, CARD_TYPES, PS5_BLUE } from '../utils/constants';
import ConfirmationDialog from './ConfirmationDialog';
import { Card } from '../types'; // Removed SyncStatus, UserData
import { useCards } from '../hooks/useCards';
import { FeedbackType } from '../hooks/useFeedback';
import { useFeedback } from '../hooks/useFeedback';
import { cardApi, ApiError, NetworkError, ValidationError } from '../api/cardApi';
import Header from './Header';
// Removed CardFormModal import as it's not found and form is inline
import ConflictResolutionModal from './ConflictResolutionModal';
import Footer from './Footer';
import SearchBar from './SearchBar';

// Lazy load components for better performance
const CardList = lazy(() => import('./CardList'));
const CardListView = lazy(() => import('./CardListView'));
const OptimizedAddCardModal = lazy(() => import('./forms/OptimizedAddCardModal'));
const OptimizedCardDetailModal = lazy(() => import('./card-detail/OptimizedCardDetailModal'));

// Main component for the Card Wallet application
const feedbackColors: Record<FeedbackType, string> = {
  success: 'rgba(74, 222, 128, 0.9)', // green-400 with opacity
  error: 'rgba(248, 113, 113, 0.9)',   // red-400 with opacity
  warning: 'rgba(251, 191, 36, 0.9)', // amber-400 with opacity
  info: 'rgba(96, 165, 250, 0.9)',    // blue-400 with opacity
  loading: 'rgba(59, 130, 246, 0.9)',  // blue-500 with opacity
};

const OptimizedCardWallet: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const { darkMode, listView } = useTheme();
  
  // Get user preferences from context
  const {
    sortBy: userSortPreference,
    lastExpandedCategory: userExpandedCategory,
    searchTerm: savedSearchTerm,
    showSearch: savedShowSearch,
    setSortPreference,
    setExpandedCategory,
    setSearchTerm,
    setShowSearch
  } = useUserPreferences();
  
  // Use custom hooks for better code organization and reduced bundle size
  const {
    groupedCards, getFilteredCategories, selectedCard, setSelectedCard, editingCardData,
    addCard, updateCardField, deleteCard, startEditingCard, sortBy, setSortOption,
    saveEditedCard,
    cancelEditingCard,
    isLoading: cardsIsLoading,
    loadError: cardsLoadError,
    showConflictModal,
    conflictPairs,
    currentConflictIndex,
    handleConflictResolution,
    skipConflict,
    processNextConflictOrFinalize,
    lastSyncOutcome, // Destructure new state
    clearLastSyncOutcome // Destructure new function
  } = useCards();
  
  // Initialize search state from preferences
  const [searchValue, setSearchValue] = useState(savedSearchTerm);
  
  // Update card sorting from user preferences
  useEffect(() => {
    if (userSortPreference) {
      setSortOption(userSortPreference as any);
    }
  }, [userSortPreference, setSortOption]);

  // Effect to show feedback based on sync outcome
  useEffect(() => {
    if (lastSyncOutcome === 'partial_failure') {
      showFeedback(
        "Some local cards could not be synced. They will be re-attempted on your next login.",
        "warning",
        5000 // Duration in ms
      );
      clearLastSyncOutcome(); // Reset the outcome so message doesn't reappear
    } else if (lastSyncOutcome === 'success') {
      showFeedback(
        "Local cards synced successfully with the server.",
        "success",
        3000 // Duration in ms
      );
      clearLastSyncOutcome(); // Reset the outcome
    }
  }, [lastSyncOutcome, showFeedback, clearLastSyncOutcome]);
  
  // Get custom hook state and methods
  const { feedbackMessage, showFeedback, clearFeedback } = useFeedback(); // Corrected to feedbackMessage

  // Local state for UI elements (MUST BE BEFORE EARLY RETURNS)
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [expandedCategory, setExpandedCategoryInternal] = useState<string | null>(userExpandedCategory);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<Card | number | null>(null);
  const [newCard, setNewCard] = useState<Omit<Card, 'id'>>({
    ...INITIAL_CARD_STATE,
    verified: true,
    photo: null
  });

  // Global loading and error display related to cards
  if (cardsIsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem' }}>
        Loading cards...
      </div>
    );
  }

  if (cardsLoadError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red', padding: '20px', textAlign: 'center' }}>
        <h2>Error Loading Cards</h2>
        <p>{cardsLoadError.message}</p>
        <p>Please try refreshing the page. If the problem persists, contact support.</p>
        <button onClick={() => window.location.reload()} style={{padding: '10px 20px', marginTop: '20px'}}>Refresh Page</button>
      </div>
    );
  }
  
  // --- Event Handlers ---
  const handleAddCard = () => {
    if (!newCard.name && (newCard.type === 'business' || newCard.isMyCard)) {
      showFeedback('Name is required for business cards', 'error');
      return;
    }
    
    if (!newCard.company) {
      showFeedback('Company/Club name is required', 'error');
      return;
    }
    
    addCard(newCard);
    setNewCard({ ...INITIAL_CARD_STATE });
    setIsAddingCard(false);
    showFeedback('Card added successfully!', 'success');
  };
  
  const handleUpdateField = (fieldName: string, value: string | boolean) => {
    // Update the editing card field
    if (editingCardData) {
      updateCardField(fieldName, value);
    }
  };
  
  const handleColorChange = (color: string) => {
    handleUpdateField('color', color);
  };
  
  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
  };
  
  const handleCloseDetail = () => {
    setSelectedCard(null);
  };
  
  const handleDeleteCard = (cardOrId: Card | number) => {
    setCardToDelete(cardOrId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (cardToDelete) {
      try {
        // Show loading feedback
        showFeedback('Deleting card...', 'loading');
        
        await deleteCard(cardToDelete);
        setShowDeleteConfirm(false);
        setCardToDelete(null);
        
        // Clear sticky feedback and show success
        clearFeedback();
        showFeedback('Card deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting card:', error);
        
        // Clear sticky loading message
        clearFeedback();
        
        // Keep dialog open only for validation errors
        if (error instanceof ValidationError) {
          showFeedback(`Validation error: ${error.message}`, 'error');
        } else if (error instanceof NetworkError) {
          showFeedback('Network error while deleting card. Please try again.', 'error');
          // Close dialog but keep card reference
          setShowDeleteConfirm(false);
        } else if (error instanceof ApiError) {
          if (error.status === 404) {
            // If card not found, we can consider it deleted
            setShowDeleteConfirm(false);
            setCardToDelete(null);
            showFeedback('Card was already deleted or not found', 'warning');
          } else {
            showFeedback(`Server error (${error.status}): ${error.message}`, 'error');
            setShowDeleteConfirm(false);
          }
        } else {
          showFeedback('An unexpected error occurred while deleting the card', 'error');
          setShowDeleteConfirm(false);
        }
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setCardToDelete(null);
  };

  const handleEditToggle = () => {
    if (selectedCard) {
      startEditingCard(selectedCard);
    }
  };
  
  const handleSaveEdit = async () => {
    try {
      // Show loading feedback
      showFeedback('Updating card...', 'loading');
      
      // Use the dedicated save function from the hook
      await saveEditedCard();
      
      // Clear sticky feedback and show success
      clearFeedback();
      showFeedback('Card updated successfully', 'success');
    } catch (error) {
      console.error('Error updating card:', error);
      
      // Clear sticky loading message
      clearFeedback();
      
      // Handle different types of errors
      if (error instanceof ValidationError) {
        showFeedback(`Validation error: ${error.message}`, 'error');
        // Keep editing mode so user can fix the issue
      } else if (error instanceof NetworkError) {
        showFeedback('Network error while updating card. Will retry automatically.', 'error');
      } else if (error instanceof ApiError) {
        if (error.status === 404) {
          showFeedback('This card no longer exists in the system', 'error');
          // Exit edit mode since card doesn't exist
          cancelEditingCard();
        } else {
          showFeedback(`Server error (${error.status}): ${error.message}`, 'error');
        }
      } else {
        showFeedback('An unexpected error occurred while updating the card', 'error');
      }
    }
  };
  
  const handleCancelEdit = () => {
    // Use the dedicated cancel function from the hook
    cancelEditingCard();
  };
  
  const handleToggleCategory = (category: string) => {
    const newExpandedCategory = expandedCategory === category ? null : category;
    setExpandedCategoryInternal(newExpandedCategory);
    setExpandedCategory(newExpandedCategory);
  };
  
  const handleOpenAddModal = () => {
    setIsAddingCard(true);
  };
  
  const handleCloseAddModal = () => {
    setIsAddingCard(false);
    setNewCard({ ...INITIAL_CARD_STATE });
    setIsScanning(false);
  };
  
  const handleNewCardChange = (updatedCardData: Omit<Card, 'id'>) => {
    setNewCard(updatedCardData);
  };
  
  const handleScanToggle = (scanState: boolean) => {
    setIsScanning(scanState);
  };
  
  // Simplified user icon click - just navigate to login if not authenticated
  const handleUserIconClick = () => {
    if (!auth.isAuthenticated) {
      navigate('/login');
    } else {
      // Show logout confirmation directly instead of a menu
      setShowLogoutConfirm(true);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };
  
  const handleConfirmLogout = async () => {
    try {
      // Set loading state
      setIsLoggingOut(true);
      
      // Simulate network request for logout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Call logout from AuthContext
      auth.logout();
      
      // Show feedback message
      showFeedback('Logged out successfully', 'success');
    } catch (error) {
      // Handle potential errors
      showFeedback('Failed to logout. Please try again.', 'error');
    } finally {
      // Close the confirmation dialog and reset loading state
      setShowLogoutConfirm(false);
      setIsLoggingOut(false);
    }
  };
  
  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Handler to open the delete account confirmation
  const handleDeleteAccountClick = () => {
    setShowDeleteAccountConfirm(true);
  };

  // Handler to confirm and execute account deletion
  const handleConfirmDeleteAccount = async () => {
    if (!auth.token) {
      showFeedback('Authentication token not found. Please log in again.', 'error');
      setShowDeleteAccountConfirm(false);
      return;
    }
    setIsDeletingAccount(true);
    try {
      const response = await deleteAccount(auth.token);
      if (response.message && response.message.toLowerCase().includes('successfully')) {
        showFeedback('Account deleted successfully. You have been logged out.', 'success');
        auth.logout(); // Clear auth state, token from localStorage
      } else {
        throw new Error(response.message || 'Failed to delete account. Please try again.');
      }
    } catch (error: any) {
      console.error('Account deletion error:', error);
      showFeedback(error.message || 'An error occurred while deleting your account.', 'error');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountConfirm(false);
    }
  };

  // Handler to cancel account deletion
  const handleCancelDeleteAccount = () => {
    setShowDeleteAccountConfirm(false);
  };
  
  const simulateScan = async () => {
    setIsScanning(true);
    showFeedback('Scanning card...', 'loading');
    
    try {
      const scanData = await cardApi.scanCard();
      setNewCard({
        ...INITIAL_CARD_STATE,
        ...scanData
      });
      
      clearFeedback();
      showFeedback('Card details scanned successfully!', 'success');
    } catch (error) {
      console.error('Scan error:', error);
      clearFeedback();
      
      if (error instanceof NetworkError) {
        showFeedback('Network error while scanning. Please try again.', 'error');
      } else if (error instanceof ApiError) {
        if (error.status === 403) {
          showFeedback('Camera access denied or not available', 'error');
        } else if (error.status === 422) {
          showFeedback('Could not detect a valid card in frame. Please try again.', 'error');
        } else {
          showFeedback(`Scan error (${error.status}): ${error.message}`, 'error');
        }
      } else {
        showFeedback('Failed to scan card', 'error');
      }
    } finally {
      setIsScanning(false);
    }
  };
  
  const handleShareCard = (card: Card) => {
    showFeedback(`Sharing ${card.name || card.company}'s card`, 'success');
  };
  
  const handleSaveToContacts = () => {
    showFeedback('Contact saved to your device', 'success');
  };
  
  const handleSearchToggle = () => {
    const newShowSearch = !savedShowSearch;
    setShowSearch(newShowSearch);
  };
  
  const handleClearSearch = () => {
    setSearchValue('');
    setSearchTerm('');
  };
  
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setSearchTerm(value);
  };
  
  // Get filtered categories based on search term
  const filteredCategories = getFilteredCategories(savedSearchTerm);
  
  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 text-gray-800'} font-sans`}>
      <Header />

      {/* Feedback Message Area */}
      {feedbackMessage && (
        <div style={{ 
          backgroundColor: feedbackColors[feedbackMessage.type as FeedbackType] || feedbackColors.info,
          color: 'white', 
          padding: '10px', 
          borderRadius: '5px', 
          margin: '10px 0', 
          textAlign: 'center',
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {feedbackMessage.text}
        </div>
      )}

      <Suspense fallback={null}>
        {isAddingCard && (
          <OptimizedAddCardModal
            isOpen={isAddingCard}
            onClose={handleCloseAddModal}
            onAddCard={handleAddCard}
            isScanning={isScanning}
            onScanToggle={handleScanToggle}
            onSimulateScan={simulateScan}
            newCard={newCard}
            onNewCardChange={handleNewCardChange}
            cardTypes={CARD_TYPES}
          />
        )}
      </Suspense>
      
      <Suspense fallback={null}>
        {selectedCard && (
          <OptimizedCardDetailModal
            card={editingCardData || selectedCard}
            isOpen={!!selectedCard}
            onClose={handleCloseDetail}
            onDelete={handleDeleteCard}
            onShare={handleShareCard}
            onSaveToContacts={handleSaveToContacts}
            isEditing={!!editingCardData}
            onEditToggle={handleEditToggle}
            onSaveEdit={handleSaveEdit} // Pass the corrected handler
            onCancelEdit={handleCancelEdit} // Pass the corrected handler
            onUpdateField={handleUpdateField}
            onColorChange={handleColorChange}
            cardTypes={CARD_TYPES}
          />
        )}
      </Suspense>

      {/* Main content area with padding for footer and search bar when visible */}
      <div className={`flex-1 px-4 overflow-y-auto ${savedShowSearch ? 'pb-36' : 'pb-16'}`}>
        {/* Card List */}
        <Suspense fallback={<div className="p-4 text-center">Loading cards...</div>}>
        {/* Empty space for feedback messages */}
        <div className="h-4"></div>
        {filteredCategories.length > 0 ? (
          listView ? (
            <CardListView
              groupedCards={groupedCards}
              orderedCategories={filteredCategories}
              expandedCategory={expandedCategory}
              onToggleCategory={handleToggleCategory}
              onCardClick={handleCardClick}
              onCardDelete={handleDeleteCard}
              searchTerm={savedSearchTerm}
            />
          ) : (
            <CardList
              groupedCards={groupedCards}
              orderedCategories={filteredCategories}
              expandedCategory={expandedCategory}
              onToggleCategory={handleToggleCategory}
              onCardClick={handleCardClick}
              onCardDelete={handleDeleteCard}
              searchTerm={savedSearchTerm}
            />
          )
        ) : (
          <div className={`mt-8 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <p className="text-lg font-medium">No cards found</p>
            <p className="mt-2">Try adjusting your search or add a new card</p>
            <button
              className="mt-4 px-4 py-2 rounded-md text-white font-medium"
              style={{ backgroundColor: PS5_BLUE }}
              onClick={handleOpenAddModal}
            >
              Add New Card
            </button>
          </div>
        )}
        </Suspense>
      </div>

      {/* Search Bar - Appears above footer when active */}
      <SearchBar
        searchTerm={searchValue}
        onSearchChange={(e) => handleSearchChange(e.target.value)}
        onClearSearch={handleClearSearch}
        sortBy={sortBy}
        onSortChange={(option) => {
          setSortOption(option);
          setSortPreference(option);
        }}
        showSearch={savedShowSearch}
      />

      {/* Footer */}
      <Footer
        onUserClick={handleUserIconClick}
        onSearchToggle={handleSearchToggle}
        onAddClick={handleOpenAddModal}
        showSearch={savedShowSearch}
        sortBy={sortBy}
      />

      {/* Logout Button - moved to top right corner */}
      {auth.isAuthenticated && (
        <div className="fixed top-4 right-4 z-30">
          <button
            className="p-2 rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 bg-red-700 hover:bg-red-600 text-white"
            onClick={handleLogoutClick}
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
      
      {/* Conflict Resolution Modal */}
      {showConflictModal && conflictPairs.length > 0 && (
        <ConflictResolutionModal
          isOpen={showConflictModal}
          conflictPair={conflictPairs[currentConflictIndex] || null}
          onClose={async () => { // Decide later: skip this one and move to next or finalize
            skipConflict();
            await processNextConflictOrFinalize();
          }}
          onResolve={async (choice) => {
            await handleConflictResolution(choice);
            await processNextConflictOrFinalize();
          }}
        />
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access your cards."
        confirmText={isLoggingOut ? "Logging out..." : "Logout"}
        cancelText="Cancel"
        onConfirm={handleConfirmLogout}
        onCancel={handleCancelLogout}
        isDestructive={true}
        isLoading={isLoggingOut}
      />
      
      {/* Delete Card Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Confirm Delete Card"
        message="Are you sure you want to delete this card? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
      />

      {/* Delete Account Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteAccountConfirm}
        title="Confirm Account Deletion"
        message={<>Are you sure you want to delete your account? This action is <strong>permanent</strong> and will remove all your cards and associated data. <br/><br/><strong>This cannot be undone.</strong></>}
        confirmText={isDeletingAccount ? "Deleting Account..." : "Yes, Delete My Account"}
        cancelText="Cancel"
        onConfirm={handleConfirmDeleteAccount}
        onCancel={handleCancelDeleteAccount}
        isDestructive={true}
        isLoading={isDeletingAccount}
      />
    </div>
  );
};

export default OptimizedCardWallet;