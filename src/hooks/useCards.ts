import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { Card, CardType, GroupedCards } from '../types';
import { CATEGORY_LABELS } from '../utils/constants';


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
    const [cards, setCards] = useState<Card[]>([]); // This holds server cards for the authenticated user
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    const [editingCardData, setEditingCardData] = useState<Card | null>(null);
    const [originalEditingCard, setOriginalEditingCard] = useState<Card | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('none');

    // State for advanced sync conflict resolution
    const [conflictPairs, setConflictPairs] = useState<Array<{ local: Omit<Card, 'id' | 'userId'>; server: Card }>>([]);
    const [showConflictModal, setShowConflictModal] = useState<boolean>(false);
    const [currentConflictIndex, setCurrentConflictIndex] = useState<number>(0);
    const [cardsToUploadDirectly, setCardsToUploadDirectly] = useState<Omit<Card, 'id' | 'userId'>[]>([]);
    
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
    setIsLoading(false);
  } catch (error) {
    console.error('Error loading cards:', error);
    setLoadError(error as Error);
    setIsLoading(false);
  }
}, [auth.isAuthenticated, auth.userId, auth.token, setCards, setLoadError, setIsLoading]);
  useEffect(() => {
    loadCards();
  }, [loadCards]);

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
          const errorBody = await response.text(); // Or response.json() if backend sends structured errors
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
            console.log(`No conflicts. Uploading ${newCardsForServerUpdate.length} new cards.`);
            let cardsSyncedCount = 0;
            for (const cardToUpload of newCardsForServerUpdate) {
              try {
                await addCard(cardToUpload);
                cardsSyncedCount++;
              } catch (error) {
                console.error('Error syncing new local card:', cardToUpload.name, error);
              }
            }
            if (cardsSyncedCount > 0) {
              console.log(`Successfully synced ${cardsSyncedCount} new cards to server.`);
            }
            localStorage.removeItem(LOCAL_UNAUTH_CARDS_KEY); // Clear after successful sync
            console.log('Cleared local unauthenticated cards after uploading new cards.');
          } else {
            localStorage.removeItem(LOCAL_UNAUTH_CARDS_KEY);
            console.log('No conflicts or new cards to upload. Local cards were identical or none. Cleared local unauthenticated cards.');
          }
        } else {
          localStorage.removeItem(LOCAL_UNAUTH_CARDS_KEY); // Clean up if it was empty or invalid
          console.log('No valid local unauthenticated cards found after parsing. Cleared storage if it existed.');
        }
      } else {
        console.log('No local unauthenticated cards key found in localStorage. Nothing to sync.');
      }
    } else {
      // Optional: console.log('[useCards.ts] syncLocalCards: User not authenticated or initial load in progress. Skipping sync.');
    }
  }, [auth.isAuthenticated, auth.userId, cards, addCard, isLoading]);

    // Handler for when all conflicts are resolved and/or new cards uploaded
    const finalizeSync = useCallback(() => {
      localStorage.removeItem(LOCAL_UNAUTH_CARDS_KEY);
      console.log('Finalized sync: Cleared local unauthenticated cards.');
      setShowConflictModal(false);
      setShowConflictModal(false); // Ensure modal is hidden
      setConflictPairs([]);
      setCardsToUploadDirectly([]);
      setCurrentConflictIndex(0);
      console.log('Sync process finalized.');
    }, []); // No dependencies needed as it only resets state

    const processNextConflictOrFinalize = useCallback(async () => {
      const nextIndex = currentConflictIndex + 1;
      if (nextIndex < conflictPairs.length) {
        setCurrentConflictIndex(nextIndex);
      } else {
        // All conflicts processed, now upload cards marked for direct upload
        if (cardsToUploadDirectly.length > 0) {
          console.log(`Uploading ${cardsToUploadDirectly.length} cards directly.`);
          let successfullyUploadedCount = 0;
          for (const cardToUpload of cardsToUploadDirectly) {
            try {
              await addCard(cardToUpload); // addCard expects Omit<Card, 'id' | 'userId'>
              successfullyUploadedCount++;
            } catch (error) {
              console.error('Error uploading card during conflict finalization:', cardToUpload.name, error);
            }
          }
          console.log(`Successfully uploaded ${successfullyUploadedCount} out of ${cardsToUploadDirectly.length} cards after conflict resolution.`);
        }
        finalizeSync();
      }
    }, [currentConflictIndex, conflictPairs, cardsToUploadDirectly, addCard, finalizeSync]);

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
    if (auth.isAuthenticated && auth.userId && !isLoading && cards && !hasSyncedRef.current) {
      console.log('[useCards.ts] Conditions met for sync, scheduling syncLocalCards.');
      const timerId = setTimeout(() => {
        console.log('[useCards.ts] Timer fired, attempting to call syncLocalCards.');
        syncLocalCards();
        hasSyncedRef.current = true;
      }, 1500);
      return () => clearTimeout(timerId);
    }
  }, [auth.isAuthenticated, auth.userId, cards, isLoading, syncLocalCards]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      hasSyncedRef.current = false; // Reset sync flag on logout
    }
  }, [auth.isAuthenticated]);
  
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
    // Conflict resolution state and handlers (to be expanded)
    showConflictModal,
    conflictPairs,
    currentConflictIndex,
    finalizeSync,
    handleConflictResolution,
    skipConflict,
    processNextConflictOrFinalize
  };
  console.log('[useCards.ts] Hook executing - END, returning:', returnedObject);
  return returnedObject;
  } catch (error) {
    console.error('[useCards.ts] CRITICAL ERROR IN HOOK:', error);
    throw error; // Re-throw the error to be caught by an ErrorBoundary or break execution
  }
};
