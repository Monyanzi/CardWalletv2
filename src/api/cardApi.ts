import { Card } from '../types';

// Custom error types for better error handling
export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export class NetworkError extends Error {
  retriesLeft: number;
  
  constructor(message: string, retriesLeft: number = 3) {
    super(message);
    this.name = 'NetworkError';
    this.retriesLeft = retriesLeft;
  }
}

export class ValidationError extends Error {
  field?: string;
  
  constructor(message: string, field?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Utility for simulating random failures (useful for testing error handling)
const simulateRandomFailure = (failureRate: number = 0.1): boolean => {
  return Math.random() < failureRate;
};

// Generic retry function for network operations
const withRetry = async <T>(operation: () => Promise<T>, maxRetries: number = 3): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // If it's not a network error or we're out of retries, throw immediately
      if (!(error instanceof NetworkError) || attempt >= maxRetries - 1) {
        throw error;
      }
      
      // Wait a bit longer between each retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 300;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never happen because the for loop will exit with a throw
  throw lastError || new Error('Unknown error during retry');
};

// Simulate API calls with local functions
// In production, these would be actual API calls

/**
 * Lightweight API layer to simulate backend calls
 * This will drastically reduce app size by moving data management out of components
 */
export const cardApi = {
  // Get all cards (simulated API call)
  getCards: async (): Promise<Card[]> => {
    return withRetry(async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulate random network error
      if (simulateRandomFailure(0.05)) {
        throw new NetworkError('Failed to fetch cards due to network error');
      }
      
      // Simulate random server error
      if (simulateRandomFailure(0.02)) {
        throw new ApiError('Server error while fetching cards', 500);
      }
      
      // No longer using SAMPLE_CARDS since we're using the real API now
      return [] as Card[];
    });
  },
  
  // Add a new card (simulated API call)
  addCard: async (card: Omit<Card, 'id'>): Promise<Card> => {
    return withRetry(async () => {
      // Input validation
      if (!card) {
        throw new ValidationError('Card data is required');
      }
      
      // Business/personal card validation
      if ((card.type === 'business' || card.isMyCard) && !card.name) {
        throw new ValidationError('Name is required for business cards', 'name');
      }
      
      if (!card.company) {
        throw new ValidationError('Company/Club name is required', 'company');
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulate random network error
      if (simulateRandomFailure(0.05)) {
        throw new NetworkError('Network error while adding card');
      }
      
      // Simulate random server error
      if (simulateRandomFailure(0.02)) {
        throw new ApiError('Server error while adding card', 500);
      }
      
      // Generate a new ID for the card
      const newCard = {
        ...card,
        id: Date.now(),
        logo: card.logo || 'placeholder',
        photo: card.photo || null,
      } as Card;
      
      return newCard;
    });
  },
  
  // Update an existing card (simulated API call)
  updateCard: async (card: Card): Promise<Card> => {
    return withRetry(async () => {
      // Validate input
      if (!card) {
        throw new ValidationError('Card data is required');
      }
      
      if (!card.id) {
        throw new ValidationError('Card ID is required', 'id');
      }
      
      // Business/personal card validation
      if ((card.type === 'business' || card.isMyCard) && !card.name) {
        throw new ValidationError('Name is required for business cards', 'name');
      }
      
      if (!card.company) {
        throw new ValidationError('Company/Club name is required', 'company');
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulate random network error
      if (simulateRandomFailure(0.05)) {
        throw new NetworkError('Network error while updating card');
      }
      
      // Simulate random not found error
      if (simulateRandomFailure(0.02)) {
        throw new ApiError(`Card with ID ${card.id} not found`, 404);
      }
      
      return card;
    });
  },
  
  // Delete a card (simulated API call)
  deleteCard: async (cardOrId: Card | number): Promise<boolean> => {
    return withRetry(async () => {
      // Validate input
      if (!cardOrId) {
        throw new ValidationError('Card ID is required');
      }
      
      const cardId = typeof cardOrId === 'number' ? cardOrId : cardOrId.id;
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Simulate random network error
      if (simulateRandomFailure(0.05)) {
        throw new NetworkError('Network error while deleting card');
      }
      
      // Simulate random not found error
      if (simulateRandomFailure(0.02)) {
        throw new ApiError(`Card with ID ${cardId} not found`, 404);
      }
      
      return true; // Successfully deleted
    });
  },
  
  // Scan a card (simulated API call)
  scanCard: async (): Promise<Partial<Card>> => {
    return withRetry(async () => {
      // Simulate network delay (scanning takes longer)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate camera/hardware permission error
      if (simulateRandomFailure(0.05)) {
        throw new ApiError('Camera access denied or not available', 403);
      }
      
      // Simulate general scan failure
      if (simulateRandomFailure(0.1)) {
        throw new ApiError('Failed to detect a valid card in the frame', 422);
      }
      
      // Simulate network error while processing scan
      if (simulateRandomFailure(0.05)) {
        throw new NetworkError('Network error while processing scanned card');
      }
      
      // Return simulated scanned data
      return {
        name: 'Jordan Smith',
        company: 'InnoTech Solutions',
        position: 'Sales Manager',
        type: 'business',
        color: '#f39c12',
        identifier: 'ITS-' + Math.floor(Math.random() * 10000),
        email: 'jordan@innotechsolutions.com',
        phone: '+1 (555) 123-4567',
        mobile: '+1 (555) 987-6543',
        website: 'www.innotechsolutions.com',
        address: '123 Innovation Park, San Jose, CA 95113',
        linkedinUrl: 'linkedin.com/in/jordansmith',
        verified: true,
        isMyCard: false,
      };
    }, 2); // Only retry twice for scan operations
  }
};
