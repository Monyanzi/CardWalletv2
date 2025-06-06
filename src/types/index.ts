// Card Types
export type CardType = 'business' | 'reward' | 'membership' | 'currency' | 'identification' | 'transit' | 'ticket' | 'other';

export interface Card {
  id: number;
  name: string;
  company: string;
  position?: string;
  type: CardType;
  color: string;
  logo: string;
  identifier?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;
  linkedinUrl?: string;
  verified: boolean;
  barcode?: string;
  barcodeType?: 'code128' | 'qr';
  barcodeData?: string;
  qrCodeData?: string;
  balance?: string;
  expiry?: string;
  date?: string;
  time?: string;
  seat?: string;
  venue?: string;
  isMyCard: boolean;
  photo: string | null;
  department?: string;
  notes?: string;
}

export interface CategoryLabel {
  [key: string]: string;
}

export interface GroupedCards {
  [key: string]: Card[];
}

export interface FeedbackMessage {
  text: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'loading';
}

export interface SyncStatus {
  message: string;
  type: 'success' | 'error' | 'info' | 'syncing';
}

export interface UserData {
  name: string;
  email: string;
  password: string;
  isSignUp: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}