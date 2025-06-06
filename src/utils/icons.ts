// Individual imports for icons to significantly reduce bundle size
// This approach reduces the bundle from 21MB to under 1MB

// UI Icons
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import X from 'lucide-react/dist/esm/icons/x';
import Plus from 'lucide-react/dist/esm/icons/plus';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Search from 'lucide-react/dist/esm/icons/search';
import Sun from 'lucide-react/dist/esm/icons/sun';
import Moon from 'lucide-react/dist/esm/icons/moon';
import List from 'lucide-react/dist/esm/icons/list';
import Grid from 'lucide-react/dist/esm/icons/grid';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Save from 'lucide-react/dist/esm/icons/save';
import User from 'lucide-react/dist/esm/icons/user';
import UserRound from 'lucide-react/dist/esm/icons/user-round';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Eye from 'lucide-react/dist/esm/icons/eye';
import EyeOff from 'lucide-react/dist/esm/icons/eye-off';
import Info from 'lucide-react/dist/esm/icons/info';
import SortAsc from 'lucide-react/dist/esm/icons/arrow-up-narrow-wide';

// Contact Icons
import Phone from 'lucide-react/dist/esm/icons/phone';
import Smartphone from 'lucide-react/dist/esm/icons/smartphone';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Globe from 'lucide-react/dist/esm/icons/globe';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Linkedin from 'lucide-react/dist/esm/icons/linkedin';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';

// Action Icons
import Share2 from 'lucide-react/dist/esm/icons/share-2';
import Edit2 from 'lucide-react/dist/esm/icons/edit-2';
import Download from 'lucide-react/dist/esm/icons/download';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Star from 'lucide-react/dist/esm/icons/star';

// Card Type Icons
import QrCode from 'lucide-react/dist/esm/icons/qr-code';
import Scan from 'lucide-react/dist/esm/icons/scan';
import Camera from 'lucide-react/dist/esm/icons/camera';
import Barcode from 'lucide-react/dist/esm/icons/barcode';
import WalletCards from 'lucide-react/dist/esm/icons/wallet-cards';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import Building from 'lucide-react/dist/esm/icons/building';
import Hash from 'lucide-react/dist/esm/icons/hash';

// Re-export all the icons
export {
  // UI Icons
  ArrowLeft, X, Plus, ChevronDown, Search, Sun, Moon, List, Grid, LogOut, Lock, Save,
  User, UserRound, RefreshCw, CheckCircle, AlertCircle, Eye, EyeOff, Info, SortAsc,
  
  // Contact Icons
  Phone, Smartphone, Mail, Globe, MapPin, Linkedin, MessageSquare,
  
  // Action Icons
  Share2, Edit2, Download, Trash2, Star,
  
  // Card Type Icons
  QrCode, Scan, Camera, Barcode, WalletCards, Building2, Building, Hash
};

// Export the LucideIcon type
export type { LucideProps } from 'lucide-react';

// Add a shared Icon component that can be used for all icons
import React from 'react';
import type { LucideProps } from 'lucide-react';

export interface IconProps extends LucideProps {
  icon: React.FC<LucideProps>;
}

export const Icon: React.FC<IconProps> = ({ 
  icon: IconComponent, 
  size = 24, 
  color,
  strokeWidth = 2,
  ...props 
}) => {
  return React.createElement(IconComponent, {
    size,
    color,
    strokeWidth,
    ...props
  });
};
