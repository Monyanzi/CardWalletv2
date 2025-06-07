import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { Card, CardType, GroupedCards } from '../types';
import { CATEGORY_LABELS } from '../utils/constants';

// Local storage keys
const CARD_WALLET_APP_CARDS_KEY = 'cardWalletApp_cards';
const CARD_WALLET_APP_MY_CARDS_KEY = 'cardWalletApp_myCards';
const CARD_WALLET_APP_SHARED_CARDS_KEY = 'cardWalletApp_sharedCards';

export type SortOption = 'name' | 'company' | 'none';

// Helper function to compare two cards for semantic identity (excluding id, userId, and dynamic fields like photo, qrCodeUrl)
const areCardsSemanticallyIdentical = (card1: Partial<Card>, card2: Partial<Card>): boolean => {
  // Fields from Card interface, excluding id, userId, photo, qrCodeData, barcodeData, and other volatile fields.
  // Note: 'color' is the correct field, not 'cardColor'. 'type' is used instead of 'category'.
  const fieldsToCompare: Array<keyof Omit<Card, 'id' | 'userId' | 'photo' | 'qrCodeData' | 'barcodeData' | 'barcode' | 'barcodeType' | 'logo'>> = [
    'name', 'company', 'position', 'email', 'phone', 'mobile',
    'address', 'website', 'notes', 'type',
    'isMyCard', 'color', 'linkedinUrl', 'verified',
    'identifier', 'balance', 'expiry', 'date', 'time', 'seat', 'venue', 'department'
  ];

  for (const field of fieldsToCompare) {
    const val1 = card1[field] === null || card1[field] === undefined ? "" : card1[field];
    const val2 = card2[field] === null || card2[field] === undefined ? "" : card2[field];
    
    // Special handling for type CardType which is a string literal union
    if (field === 'type') {
      if ((val1 as CardType)?.trim() !== (val2 as CardType)?.trim()) return false;
    } else if (typeof val1 === 'string' && typeof val2 === 'string') {
      if (val1.trim() !== val2.trim()) return false;
    } else if (val1 !== val2) {
      return false;
    }
  }
  return true;
};

// Helper function to validate and normalize CardType
const VALID_CARD_TYPES: CardType[] = ['business', 'reward', 'membership', 'currency', 'identification', 'transit', 'ticket', 'other'];
const isValidCardType = (type: any): type is CardType => {
  return typeof type === 'string' && VALID_CARD_TYPES.includes(type as CardType);
};

const normalizeCardType = (card: any): Card => {
  // Ensure card is an object and has a 'type' property before proceeding
  if (typeof card !== 'object' || card === null || !('type' in card)) {
    console.warn('Invalid card object encountered during normalization:', card);
    // Attempt to return a minimally valid Card structure with a default type
    return { ...card, type: 'other' } as Card; // This is a risky cast if card is not mostly Card-like
  }

  if (!isValidCardType(card.type)) {
    console.warn(`Invalid card type "${card.type}" found for card "${card.name || 'Unknown Card'}". Defaulting to "other".`);
    return { ...card, type: 'other' } as Card; // Cast to Card after fixing type
  }
  return card as Card; // Type is valid, cast to Card
};

// This custom hook centralizes all card management logic
const LOCAL_UNAUTH_CARDS_KEY = 'cardwallet_local_unauth_cards';
const AUTH_USER_CARDS_KEY_PREFIX = 'cardwallet_cards_user_';

export const useCards = () => {
  const hasSyncedRef = useRef(false);
  console.log('[useCards.ts] Hook executing - START');
  try {
    console.log('[useCards.ts] CATEGORY_LABELS at hook start:', CATEGORY_LABELS);
    const auth = useAuth(); // Get auth context
    // Initialize state from localStorage if available, otherwise default to empty array
    const [cards, setCards] = useState<Card[]>(() => {
      // Load cards from primary localStorage key upon hook initialization
      if (typeof window !== 'undefined') {
        try {
          const storedCards = localStorage.getItem(CARD_WALLET_APP_CARDS_KEY);
          if (storedCards) {
            console.log('[useCards.ts] Initializing cards from cardWalletApp_cards');
            return JSON.parse(storedCards); // Parse stored JSON data
          }
        } catch (error) {
          console.error('Error loading cards from CARD_WALLET_APP_CARDS_KEY:', error);
          localStorage.removeItem(CARD_WALLET_APP_CARDS_KEY); // Clear potentially corrupted data
        }
      }
      return []; // Default to empty array if not in localStorage or if an error occurred
    });
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [editingCardData, setEditingCardData] = useState<Card | null>(null);
    const [originalEditingCard, setOriginalEditingCard] = useState<Card | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('none');

    // State for advanced sync conflict resolution
    const [conflictPairs, setConflictPairs] = useState<Array<{ local: Omit<Card, 'id' | 'userId'>; server: Card }>>([]);
    const [showConflictModal, setShowConflictModal] = useState<boolean>(false);
    const [currentConflictIndex, setCurrentConflictIndex] = useState<number>(0);
    const [cardsToUploadDirectly, setCardsToUploadDirectly] = useState<Omit<Card, 'id' | 'userId'>[]>([]);
    const [lastSyncOutcome, setLastSyncOutcome] = useState<'success' | 'partial_failure' | null>(null);
    
    // State for tracking loading and error states
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<Error | null>(null);
  

  const loadCards = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      setCards([]); // Reset cards state before loading new data
      
      // Clear all localStorage keys related to cards to prevent corruption/duplication
      const userCacheKey = `${AUTH_USER_CARDS_KEY_PREFIX}${auth.userId}`;
      if (typeof window !== 'undefined') {
        localStorage.removeItem(userCacheKey);
        localStorage.removeItem(LOCAL_UNAUTH_CARDS_KEY);
      }
      
      if (auth.isAuthenticated && auth.token) {
        // Fetch cards from API for authenticated users
        console.log('[useCards.ts] loadCards: Fetching cards for authenticated user:', auth.userId);
        try {
          const response = await fetch('http://localhost:5002/api/cards', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${auth.token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch cards: ${response.status} ${response.statusText}`);
          }
          
          const apiCardsData = await response.json();
          console.log(`[useCards.ts] loadCards: Fetched apiCardsData. Length: ${apiCardsData.length}`);
          
          if (apiCardsData.length > 0) {
            console.log('[useCards.ts] loadCards: Sample apiCard[0]:', JSON.stringify(apiCardsData[0]));
            if (apiCardsData.length > 12) {
              console.log('[useCards.ts] loadCards: Sample apiCard[12]:', JSON.stringify(apiCardsData[12]));
            }
          }
          
          const normalizedApiCards = apiCardsData.map((card: any, index: number) => {
            const originalCardString = JSON.stringify(card);
            // Clean up name to remove '0' suffix that appears in database
            const cleanedName = card.name ? String(card.name).replace(/0$/, '') : '';
            
            const normalizedCard = {
              id: card.id,
              userId: card.userId || auth.userId,
              type: card.cardType || 'other', // Map API's 'cardType' to frontend's 'type'
              isMyCard: card.isMyCard !== undefined ? card.isMyCard : false,
              company: card.companyName || card.company || '',
              name: cleanedName,
              position: card.position || '',
              email: card.email || '',
              phone: card.phone || '',
              mobile: card.mobile || '',
              website: card.website || '',
              address: card.address || '',
              notes: card.notes || '',
              verified: card.verified || false,
              logo: card.logo || null,
              photo: card.photoUrl || card.photo || null,
              isPublic: card.isPublic || false,
              lastModified: card.lastModified || new Date().toISOString(),
              createdAt: card.createdAt || new Date().toISOString(),
            };
            
            // Log problematic cards during normalization
            if (index < 2 || index === 11 || index === 12 || index === 23 || typeof card.cardType === 'undefined' || typeof (card.companyName || card.company) === 'undefined') {
              console.log(`[useCards.ts] loadCards: Normalizing card at index ${index}. Original: ${originalCardString}. Normalized: ${JSON.stringify(normalizedCard)}`);
            }
            
            return normalizedCard;
          }) as Card[];
          
          console.log(`[useCards.ts] loadCards: Normalized cards. Length: ${normalizedApiCards.length}`);
          
          if (normalizedApiCards.length > 0) {
            console.log('[useCards.ts] loadCards: Sample normalizedCard[0]:', JSON.stringify(normalizedApiCards[0]));
            if (normalizedApiCards.length > 12) {
              console.log('[useCards.ts] loadCards: Sample normalizedCard[12]:', JSON.stringify(normalizedApiCards[12]));
            }
          }
          
          const problemCards = normalizedApiCards.filter(c => typeof c.company === 'undefined' || typeof c.type === 'undefined');
          if (problemCards.length > 0) {
            console.error(`[useCards.ts] loadCards: Found ${problemCards.length} normalized cards with undefined company or type! Sample:`, JSON.stringify(problemCards[0]));
          }
          
          // Store normalized cards in localStorage, not raw API data
          if (typeof window !== 'undefined') {
            localStorage.setItem(userCacheKey, JSON.stringify(normalizedApiCards));
          }
          
          setCards(normalizedApiCards);
        } catch (apiError) {
          console.error('Authenticated: Error loading cards from API:', apiError);
          setLoadError(apiError as Error);
          
          // Try to load from cache if API fails
          if (typeof window !== 'undefined') {
            try {
              const cachedCardsJson = localStorage.getItem(userCacheKey);
              if (cachedCardsJson) {
                console.log('Authenticated: API failed, loading from cache for user:', auth.userId);
                try {
                  const cachedCardsRaw = JSON.parse(cachedCardsJson);
                  const normalizedCachedCards = Array.isArray(cachedCardsRaw) ? cachedCardsRaw.map(card => normalizeCardType(card as any)) : [];
                  setCards(normalizedCachedCards);
                } catch (parseError) {
                  console.error('Authenticated: Error parsing cached cards:', parseError);
                  localStorage.removeItem(userCacheKey); // Clear corrupted cache
                }
              }
            } catch (cacheError) {
              console.error('Authenticated: Error loading cards from cache:', cacheError);
            }
          }
        }
      } else { // Unauthenticated user
        if (typeof window !== 'undefined') {
          try {
            const localCardsJson = localStorage.getItem(LOCAL_UNAUTH_CARDS_KEY);
            if (localCardsJson) {
              try {
                const localCards = JSON.parse(localCardsJson);
                console.log('Unauthenticated: Loaded local cards:', localCards.length);
                const normalizedLocalCards = localCards.map((card: any) => normalizeCardType(card));
                setCards(normalizedLocalCards);
              } catch (parseError) {
                console.error('Unauthenticated: Error parsing local cards:', parseError);
                localStorage.removeItem(LOCAL_UNAUTH_CARDS_KEY); // Clear corrupted data
                setCards([]);
              }
            } else {
              console.log('Unauthenticated: No local cards found.');
              setCards([]);
            }
          } catch (error) {
            console.error('Unauthenticated: Error loading cards from local storage:', error);
            setLoadError(error as Error);
            setCards([]);
          }
        } else {
          // SSR fallback or environment without window
          setCards([]);
        }
      }
    } catch (error) {
      console.error('Error loading cards:', error);
      setLoadError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, [auth.isAuthenticated, auth.userId, auth.token, setCards, setLoadError, setIsLoading]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Effect to save cards to localStorage whenever they change
  useEffect(() => {
    // Persist cards to localStorage whenever the 'cards' state updates
    if (typeof window !== 'undefined') {
      try {
        // Save the main cards list
        console.log('[useCards.ts] Persisting cards to cardWalletApp_cards');
        localStorage.setItem(CARD_WALLET_APP_CARDS_KEY, JSON.stringify(cards));

        // Filter and save myCards (cards where isMyCard is true)
        const myCardsList = cards.filter(card => card.isMyCard);
        console.log('[useCards.ts] Persisting myCards to cardWalletApp_myCards');
        localStorage.setItem(CARD_WALLET_APP_MY_CARDS_KEY, JSON.stringify(myCardsList));

        // Filter and save sharedCards (cards where isMyCard is false)
        const sharedCardsList = cards.filter(card => !card.isMyCard);
        console.log('[useCards.ts] Persisting sharedCards to cardWalletApp_sharedCards');
        localStorage.setItem(CARD_WALLET_APP_SHARED_CARDS_KEY, JSON.stringify(sharedCardsList));
      } catch (error) {
        console.error('Error saving cards to localStorage:', error);
        // Consider how to handle errors, e.g., by notifying the user or logging to a monitoring service
      }
    }
  }, [cards]);

  // Sort cards based on the current sort option
  const sortedCards = useMemo(() => {
    if (!cards) return [];
    const sortableCards = [...cards];
    if (sortBy === 'name') {
      sortableCards.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'company') {
      sortableCards.sort((a, b) => (a.company || '').localeCompare(b.company || ''));
    }
    return sortableCards;
  }, [cards, sortBy]);

  // Group cards by category
  const groupedCards = useMemo(() => {
    return sortedCards.reduce<GroupedCards>((acc, card) => {
    // Determine category
    let category: string;
    
    if (card.isMyCard) {
      category = 'mycard';
    } else {
      category = card.type;
    }
    
    if (!acc[category]) {
      acc[category] = [];
    }
    
    acc[category].push(card);
    return acc;
  }, {});
}, [sortedCards]);

  // Get ordered categories for display
  const getOrderedCategories = useCallback(() => {
    return Object.keys(groupedCards).sort((a, b) => {
      if (a === 'mycard') return -1;
      if (b === 'mycard') return 1;
      
      const labelA = CATEGORY_LABELS[a as keyof typeof CATEGORY_LABELS] || a;
      const labelB = CATEGORY_LABELS[b as keyof typeof CATEGORY_LABELS] || b;
      
      return labelA.localeCompare(labelB);
    });
  }, [groupedCards]);

  // Filter categories based on search term
  const getFilteredCategories = useCallback((searchTerm: string) => {
    const searchTermLC = searchTerm.toLowerCase();
    return getOrderedCategories().filter(category =>
      searchTerm === '' || groupedCards[category].some(card =>
        (card.name?.toLowerCase().includes(searchTermLC) ?? false) ||
        (card.company?.toLowerCase().includes(searchTermLC) ?? false)
      )
    );
  }, [groupedCards, getOrderedCategories]);

  // Add a new card with validation and persistence
  const addCard = useCallback(async (newCardData: Omit<Card, 'id'>) => {
    if (!auth.isAuthenticated) {
      if (typeof window !== 'undefined') {
        const localCardsRaw = localStorage.getItem(LOCAL_UNAUTH_CARDS_KEY);
        const localCards = localCardsRaw ? JSON.parse(localCardsRaw) as Card[] : [];
        const newCardWithId = { ...newCardData, id: Date.now(), userId: 0 };
        const updatedLocalCards = [...localCards, newCardWithId];
        localStorage.setItem(LOCAL_UNAUTH_CARDS_KEY, JSON.stringify(updatedLocalCards));
        setCards(updatedLocalCards);
        return newCardWithId;
      } else {
        // Cannot add card for unauthenticated user without localStorage
        console.warn('Attempted to add card for unauthenticated user without window.localStorage');
        throw new Error('Operation not possible without browser storage.');
      }
    } else {
      // Authenticated: Add via API
      try {
        console.log('Authenticated: Adding card via API for user:', auth.userId);
        const response = await fetch('http://localhost:5002/api/cards', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCardData),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          if (response.status === 409) { // Conflict
            throw new Error(`DUPLICATE_CARD: A card with this name or key details already exists. ${errorBody}`);
          } else if (response.status === 422) { // Unprocessable Entity
            throw new Error(`VALIDATION_ERROR: ${errorBody}`);
          }
          throw new Error(`Failed to add card: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const addedCard = await response.json();
        await loadCards(); // Reload all cards from the server to reflect the addition
        // The localStorage update for userCacheKey will happen inside loadCards
        return addedCard;
      } catch (error) {
        console.error('Authenticated: Error adding card via API:', error);
        throw error; // Rethrow the error to be handled by the caller or a generic error boundary
      }
    }
  }, [auth.isAuthenticated, auth.userId, auth.token]);

  // Delete a card with persistence
  const deleteCard = useCallback(async (cardOrId: Card | number) => {
    const cardIdToDelete = typeof cardOrId === 'number' ? cardOrId : cardOrId.id;

    if (!auth.isAuthenticated) {
      if (typeof window !== 'undefined') {
        const localCardsRaw = localStorage.getItem(LOCAL_UNAUTH_CARDS_KEY);
        const localCards = localCardsRaw ? JSON.parse(localCardsRaw) as Card[] : [];
        const updatedLocalCards = localCards.filter(c => c.id !== cardIdToDelete);
        localStorage.setItem(LOCAL_UNAUTH_CARDS_KEY, JSON.stringify(updatedLocalCards));
        setCards(updatedLocalCards);
        if (selectedCard?.id === cardIdToDelete) setSelectedCard(null);
        if (editingCardData?.id === cardIdToDelete) setEditingCardData(null);
      }
      return;
    } else {
      // Authenticated: Delete via API
      try {
        console.log('Authenticated: Deleting card via API, ID:', cardIdToDelete);
        const response = await fetch(`http://localhost:5002/api/cards/${cardIdToDelete}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Failed to delete card: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        setCards(prevCards => {
          const updatedCards = prevCards.filter(card => card.id !== cardIdToDelete);
          const userCacheKey = `${AUTH_USER_CARDS_KEY_PREFIX}${auth.userId}`;
          if (typeof window !== 'undefined') {
            localStorage.setItem(userCacheKey, JSON.stringify(updatedCards));
          }
          return updatedCards;
        });
        if (selectedCard && selectedCard.id === cardIdToDelete) setSelectedCard(null);
        return true;
      } catch (error) {
        console.error('Authenticated: Error deleting card via API:', error);
        // Handle ApiError, NetworkError if cardApi.deleteCard throws them specifically
        throw error; // Rethrow the error to be handled by the caller or a generic error boundary
      }
    }
  }, [auth.isAuthenticated, auth.userId, auth.token, selectedCard]);

  // Update a card with persistence
  const updateCard = useCallback(async (cardToUpdate: Card) => {
    if (!auth.isAuthenticated) {
      if (typeof window !== 'undefined') {
        const localCardsRaw = localStorage.getItem(LOCAL_UNAUTH_CARDS_KEY);
        const localCards = localCardsRaw ? JSON.parse(localCardsRaw) as Card[] : [];
        const cardIndex = localCards.findIndex(c => c.id === cardToUpdate.id);
        if (cardIndex > -1) {
          const updatedLocalCards = [...localCards];
          updatedLocalCards[cardIndex] = { ...updatedLocalCards[cardIndex], ...cardToUpdate };
          localStorage.setItem(LOCAL_UNAUTH_CARDS_KEY, JSON.stringify(updatedLocalCards));
          setCards(updatedLocalCards);
        }
      }
      return cardToUpdate;
    } else {
      // Authenticated: Update via API
      try {
        console.log('Authenticated: Updating card via API, ID:', cardToUpdate.id);
        const response = await fetch(`http://localhost:5002/api/cards/${cardToUpdate.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cardToUpdate),
        });

        if (!response.ok) {
          const errorBody = await response.text();
          if (response.status === 409) { // Conflict
            throw new Error(`UPDATE_CONFLICT: This update conflicts with existing data. ${errorBody}`);
          } else if (response.status === 422) { // Unprocessable Entity
            throw new Error(`VALIDATION_ERROR: ${errorBody}`);
          }
          // Note: 404 is implicitly handled by the generic error here, UI might already catch it.
          throw new Error(`Failed to update card: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const updatedCardFromApi = await response.json();
        setCards(prevCards => {
          const updatedCardsList = prevCards.map(card => 
            card.id === updatedCardFromApi.id ? updatedCardFromApi : card
          );
          const userCacheKey = `${AUTH_USER_CARDS_KEY_PREFIX}${auth.userId}`;
          if (typeof window !== 'undefined') {
            localStorage.setItem(userCacheKey, JSON.stringify(updatedCardsList));
          }
          return updatedCardsList;
        });
        if (selectedCard && selectedCard.id === updatedCardFromApi.id) setSelectedCard(updatedCardFromApi);
        if (editingCardData && editingCardData.id === updatedCardFromApi.id) setEditingCardData(updatedCardFromApi);
        return updatedCardFromApi;
      } catch (error) {
        console.error('Authenticated: Error updating card via API:', error);
        throw error; // Rethrow the error to be handled by the caller or a generic error boundary
      }
    }
  }, [auth.isAuthenticated, auth.userId, auth.token, selectedCard, editingCardData]);

  // Start editing a card
  const startEditingCard = useCallback((card: Card) => {
    setEditingCardData({ ...card });
    setOriginalEditingCard({ ...card }); // Keep original for reset if needed
  }, []);

  // Cancel card editing
  const cancelEditingCard = useCallback(() => {
    setEditingCardData(null);
    setOriginalEditingCard(null); // Clear original as well
  }, []);

  // Save edited card
  const saveEditedCard = useCallback(async () => {
    if (editingCardData) {
      try {
        await updateCard(editingCardData);
        setEditingCardData(null);
        setOriginalEditingCard(null);
        return true;
      } catch (error) {
        // Don't clear editing state on error so user can fix the issue
        console.error('Error saving edited card:', error);
        throw error;
      }
    }
    return false;
  }, [editingCardData, updateCard]);

  // Update a field in the currently editing card
  const updateCardField = useCallback((fieldName: string, value: string | boolean) => {
    if (editingCardData) {
      setEditingCardData(prev => {
        if (!prev) return null;
        
        const updatedData = { ...prev, [fieldName]: value };
        
        // If unchecking 'isMyCard', revert type to original
        if (fieldName === 'isMyCard' && value === false && originalEditingCard) {
          console.log(`*** Reverting type from '${prev.type}' to original '${originalEditingCard.type}' because isMyCard was unchecked ***`);
          updatedData.type = originalEditingCard.type; 
        }
        
        // If checking 'isMyCard', ensure type is 'business'
        if (fieldName === 'isMyCard' && value === true) {
          updatedData.type = 'business';
        }
        
        // If changing type directly, ensure isMyCard is false unless type is 'business'
        if (fieldName === 'type' && value !== 'business') {
          updatedData.isMyCard = false;
        }
        
        return updatedData;
      });
    }
  }, [editingCardData, originalEditingCard]);

  // Set the sort option
  const setSortOption = useCallback((option: SortOption) => {
    setSortBy(option);
  }, []);

    const syncLocalCards = useCallback(async () => {
    if (typeof window === 'undefined') {
      console.warn("[useCards.ts] syncLocalCards: window is undefined, cannot access localStorage.");
      return;
    }

    if (auth.isAuthenticated && auth.userId && !isLoading) {
      const localUnauthCardsJson = localStorage.getItem(LOCAL_UNAUTH_CARDS_KEY);
      if (localUnauthCardsJson) {
        let localCardsToSync: Card[] = []; // Define and initialize
        try {
          const localCardsRaw = JSON.parse(localUnauthCardsJson);
          localCardsToSync = Array.isArray(localCardsRaw)
            ? localCardsRaw.map(card => normalizeCardType(card as any)).filter(Boolean) as Card[] // Filter out nulls if normalizeCardType can return null
            : [];
        } catch (parseError) {
          console.error('Unauthenticated: Error parsing local cards:', parseError);
          localStorage.removeItem(LOCAL_UNAUTH_CARDS_KEY); // Clear corrupted cache
          return; // Stop sync if parsing fails
        }

        if (localCardsToSync.length > 0) {
          console.log(`Found ${localCardsToSync.length} local unauthenticated cards to sync.`);

          const serverCardsList = cards; // `cards` state should hold server cards
          const detectedConflictsUpdate: Array<{ local: Omit<Card, 'id' | 'userId'>; server: Card }> = [];
          const newCardsForServerUpdate: Omit<Card, 'id' | 'userId'>[] = [];

          for (const localCard of localCardsToSync) {
            const { id: localId, ...localCardData } = localCard; // Strip local id
            const potentialServerMatch = serverCardsList.find(
              serverCard =>
                serverCard.name && localCardData.name && serverCard.name.trim().toLowerCase() === localCardData.name.trim().toLowerCase() &&
                serverCard.company && localCardData.company && serverCard.company.trim().toLowerCase() === localCardData.company.trim().toLowerCase()
            );

            if (potentialServerMatch) {
              if (!areCardsSemanticallyIdentical(localCardData, potentialServerMatch)) {
                console.log('Conflict detected:', localCardData.name, potentialServerMatch.name);
                detectedConflictsUpdate.push({ local: localCardData, server: potentialServerMatch });
              } else {
                console.log('Local card is identical to server card:', localCardData.name);
              }
            } else {
              console.log('Local card is new to server:', localCardData.name);
              newCardsForServerUpdate.push(localCardData);
            }
          }

          if (detectedConflictsUpdate.length > 0) {
            setConflictPairs(detectedConflictsUpdate);
            setCardsToUploadDirectly(newCardsForServerUpdate); // Keep new cards to upload after conflict resolution
            setCurrentConflictIndex(0);
            setShowConflictModal(true);
            console.log(`Found ${detectedConflictsUpdate.length} conflicts and ${newCardsForServerUpdate.length} new cards. Showing conflict modal.`);
          } else if (newCardsForServerUpdate.length > 0) {
            console.log(`No conflicts. Uploading ${newCardsForServerUpdate.length} new cards directly.`);
            let successfullyUploadedCount = 0;
            let directUploadFailed = false;
            for (const cardToUpload of newCardsForServerUpdate) {
              try {
                await addCard(cardToUpload);
                successfullyUploadedCount++;
              } catch (error) {
                console.error('Error syncing new local card directly:', cardToUpload.name, error);
                directUploadFailed = true;
              }
            }

            setLastSyncOutcome(directUploadFailed ? 'partial_failure' : 'success');

            if (!directUploadFailed) {
              localStorage.removeItem(LOCAL_UNAUTH_CARDS_KEY);
              console.log('Cleared local unauthenticated cards after successful direct upload of all new cards.');
            } else {
              console.warn('NOT clearing local unauthenticated cards due to direct upload failures.');
            }
            console.log(`Successfully synced ${successfullyUploadedCount} out of ${newCardsForServerUpdate.length} new cards to server (direct upload).`);

          } else { // No conflicts and no new cards to upload from local
            localStorage.removeItem(LOCAL_UNAUTH_CARDS_KEY);
            console.log('No conflicts or new cards to upload from local. Local cards were identical or none. Cleared local unauthenticated cards.');
            setLastSyncOutcome(null); // No sync actions performed, so no specific outcome.
          }
        } else { // No local cards to sync initially
          localStorage.removeItem(LOCAL_UNAUTH_CARDS_KEY); // Clean up if it was empty or invalid
          console.log('No valid local unauthenticated cards found to sync. Cleared storage if it existed.');
          setLastSyncOutcome(null);
        }
      } else { // No localUnauthCardsJson string in localStorage
        console.log('No local unauthenticated cards key found in localStorage. Nothing to sync.');
        setLastSyncOutcome(null);
      }
    } else {
      // User not authenticated or initial load in progress.
      // console.log('[useCards.ts] syncLocalCards: User not authenticated or initial load in progress. Skipping sync.');
    }
  }, [auth.isAuthenticated, auth.userId, cards, addCard, isLoading, setLastSyncOutcome]);

    // Handler for when all conflicts are resolved and/or new cards uploaded
    const finalizeSync = useCallback((syncFailed: boolean) => {
      // lastSyncOutcome should have been set by processNextConflictOrFinalize before this is called if uploads were attempted.
      if (!syncFailed) {
        localStorage.removeItem(LOCAL_UNAUTH_CARDS_KEY);
        console.log('Finalized sync: All uploads successful (post-conflict). Cleared local unauthenticated cards.');
      } else {
        console.warn('Finalized sync: Some uploads failed (post-conflict). Local unauthenticated cards NOT cleared.');
      }
      setShowConflictModal(false);
      setConflictPairs([]);
      setCardsToUploadDirectly([]); // Cleared after outcome is determined
      setCurrentConflictIndex(0);
      console.log('Sync process finalized. Modal closed, state reset.');
    }, [setShowConflictModal, setConflictPairs, setCardsToUploadDirectly, setCurrentConflictIndex]);

    const processNextConflictOrFinalize = useCallback(async () => {
      const nextIndex = currentConflictIndex + 1;
      if (nextIndex < conflictPairs.length) {
        setCurrentConflictIndex(nextIndex);
      } else {
        // All conflicts processed, now upload cards marked for direct upload
        let anyUploadFailed = false;
        const cardsWereAttempted = cardsToUploadDirectly.length > 0;

        if (cardsWereAttempted) {
          console.log(`Uploading ${cardsToUploadDirectly.length} cards directly after conflict resolution.`);
          let successfullyUploadedCount = 0;
          for (const cardToUpload of cardsToUploadDirectly) {
            try {
              await addCard(cardToUpload);
              successfullyUploadedCount++;
            } catch (error) {
              console.error('Error uploading card during conflict finalization:', cardToUpload.name, error);
              anyUploadFailed = true;
            }
          }
          console.log(`Successfully uploaded ${successfullyUploadedCount} out of ${cardsToUploadDirectly.length} cards after conflict resolution.`);
          setLastSyncOutcome(anyUploadFailed ? 'partial_failure' : 'success');
        }
        // If cardsWereAttempted is false, we don't set lastSyncOutcome here,
        // as it might have been set by syncLocalCards (direct upload part) or should remain null.

        finalizeSync(anyUploadFailed); // Pass the failure status for localStorage clearing logic
      }
    }, [currentConflictIndex, conflictPairs, cardsToUploadDirectly, addCard, finalizeSync, setLastSyncOutcome]);

    const handleConflictResolution = useCallback(async (choice: 'local' | 'server') => {
      if (!conflictPairs[currentConflictIndex]) return;

      const { local: localCardData } = conflictPairs[currentConflictIndex];

      if (choice === 'local') {
        // If user chooses local, add this local card to the list of cards to be uploaded.
        // It's already in Omit<Card, 'id' | 'userId'> format.
        setCardsToUploadDirectly(prev => [...prev, localCardData]);
        console.log('Conflict resolved: Keeping local version for', localCardData.name);
      } else if (choice === 'server') {
        // If user chooses server, the local version is discarded.
        // No specific action on the card itself, but we log it.
        console.log('Conflict resolved: Keeping server version for', localCardData.name);
      }
      // processNextConflictOrFinalize will be called separately by the UI after this to move to the next item or finalize.
    }, [conflictPairs, currentConflictIndex, cardsToUploadDirectly]); // Removed addCard, finalizeSync as they are called by processNextConflictOrFinalize

    const skipConflict = useCallback(() => {
      console.log('Skipping conflict for:', conflictPairs[currentConflictIndex]?.local.name);
      // processNextConflictOrFinalize will be called separately by the UI to move to the next item or finalize.
    }, [conflictPairs, currentConflictIndex]);


  // Effect to trigger sync when user logs in, is not currently loading, and server cards might be populated
  useEffect(() => {
    // Ensure cards are loaded (or attempted to load) before trying to sync.
    // isLoading refers to the initial load of cards for the authenticated user.
    if (auth.isAuthenticated && auth.userId && !isLoading && !hasSyncedRef.current) {
      // Check if `cards` state has been populated.
      // `cards` could be empty if the user has no cards on the server or if there was an error.
      // The critical part is that `loadCards` has finished (isLoading is false).
      // Ensure cards are not empty before attempting sync, to avoid syncing an empty list over potentially valid local unauth cards
      // if cardWalletApp_cards was empty and loadCards hasn't populated yet.
      if (cards && cards.length > 0) { // Added cards.length > 0 check
        console.log('[useCards.ts] Conditions met for sync, scheduling syncLocalCards.');
        const timerId = setTimeout(() => {
          console.log('[useCards.ts] Timer fired, attempting to call syncLocalCards.');
          syncLocalCards(); // syncLocalCards will now set the outcome
          hasSyncedRef.current = true;
        }, 1500);
        return () => clearTimeout(timerId);
      } else {
        console.log('[useCards.ts] Conditions for sync met, but cards array is currently empty. Sync deferred.');
      }
    }
  }, [auth.isAuthenticated, auth.userId, cards, isLoading, syncLocalCards]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      hasSyncedRef.current = false; // Reset sync flag on logout
      setLastSyncOutcome(null); // Clear sync outcome on logout
    }
  }, [auth.isAuthenticated, setLastSyncOutcome]);

  const clearLastSyncOutcome = useCallback(() => {
    setLastSyncOutcome(null);
  }, [setLastSyncOutcome]);
  
  const returnedObject = {
    cards,
    groupedCards, 
    selectedCard,
    setSelectedCard,
    editingCardData,
    sortBy,
    setSortOption,
    getOrderedCategories, 
    getFilteredCategories, 
    addCard,
    deleteCard,
    startEditingCard,
    cancelEditingCard,
    saveEditedCard,
    updateCardField,
    isLoading,
    loadError,
    // Conflict resolution state and handlers
    showConflictModal,
    conflictPairs,
    currentConflictIndex,
    finalizeSync, // Note: finalizeSync itself doesn't set outcome, it's set before/during calling it
    handleConflictResolution,
    skipConflict,
    processNextConflictOrFinalize,
    // Sync outcome
    lastSyncOutcome,
    clearLastSyncOutcome
  };
  console.log('[useCards.ts] Hook executing - END, returning:', returnedObject);
  return returnedObject;
  } catch (error) {
    console.error('[useCards.ts] CRITICAL ERROR IN HOOK:', error);
    throw error; // Re-throw the error to be caught by an ErrorBoundary or break execution
  }
};