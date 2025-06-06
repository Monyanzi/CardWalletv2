console.log('[constants.ts] Module evaluating');
export const PS5_BLUE = '#0070d1';

export const CATEGORY_LABELS = {
  'mycard': 'My Business Card',
  'business': 'Business Cards',
  'reward': 'Reward Cards',
  'membership': 'Memberships',
  'identification': 'ID Cards',
  'ticket': 'Tickets',
  'other': 'Other Cards'
};
console.log('[constants.ts] CATEGORY_LABELS:', CATEGORY_LABELS);

export const CARD_TYPES = Object.entries(CATEGORY_LABELS)
  .filter(([key]) => key !== 'mycard')
  .map(([value, label]) => ({ value, label }));

export const AVAILABLE_COLORS = [
  '#0070d1', // PS5 Blue
  '#e60012', // Red
  '#f39c12', // Orange
  '#16a085', // Teal
  '#8e44ad', // Purple
  '#2c3e50', // Dark Blue
  '#2ecc71', // Green (Emerald)
  '#f1c40f', // Yellow (Sun Flower)
  '#e91e63', // Pink
  '#795548', // Brown
  '#95a5a6', // Light Gray (Concrete)
  '#ffffff', // White
  '#000000'  // Black
];

export const INITIAL_CARD_STATE = {
  name: '',
  company: '',
  type: 'business' as const,
  color: PS5_BLUE,
  logo: '',
  identifier: '',
  position: '',
  email: '',
  phone: '',
  mobile: '',
  website: '',
  address: '',
  linkedinUrl: '',
  verified: true,
  barcode: '',
  barcodeType: 'code128' as const,
  balance: '',
  expiry: '',
  date: '',
  time: '',
  seat: '',
  venue: '',
  isMyCard: false,
  photo: ''
};

export const INITIAL_USER_DATA = {
  name: '',
  email: '',
  password: '',
  isSignUp: false
};