import React from 'react';
import { Phone, Mail, Globe, MapPin, Linkedin, Smartphone } from '../../utils/icons';
import { Card } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ContactActionProps {
  icon: any;
  label: string;
  value?: string;
  href?: string;
}

export const ContactAction: React.FC<ContactActionProps> = ({ icon: Icon, label, value, href }) => {
  const { darkMode } = useTheme();
  
  if (!value) return null;
  
  return (
    <a
      href={href}
      className={`flex items-center p-2 rounded-md ${
        darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
      } transition-colors`}
    >
      <Icon size={20} className="mr-2 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-xs opacity-70">{label}</p>
        <p className="font-medium truncate">{value}</p>
      </div>
    </a>
  );
};

interface EditableContactFieldProps {
  icon: any;
  label: string;
  value?: string;
  fieldName: string;
  onUpdateField?: (fieldName: string, value: string) => void;
}

const EditableContactField: React.FC<EditableContactFieldProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  fieldName,
  onUpdateField 
}) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`flex items-center p-2 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
      <Icon size={20} className="mr-2 flex-shrink-0" />
      <div className="flex-1">
        <label className="text-xs opacity-70 block">{label}</label>
        <input
          type="text"
          className={`w-full p-1 rounded text-sm ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-700'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
          value={value || ''}
          onChange={(e) => onUpdateField && onUpdateField(fieldName, e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </div>
    </div>
  );
};

interface CardContactInfoProps {
  card: Card;
  isEditing?: boolean;
  onUpdateField?: (fieldName: string, value: string | boolean) => void;
}

const CardContactInfo: React.FC<CardContactInfoProps> = ({ card, isEditing = false, onUpdateField }) => {
  const { darkMode } = useTheme();
  
  if (!card) return null;
  
  return (
    <div className="space-y-3">
      <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Contact</h4>
      <div className="grid grid-cols-1 gap-2">
        {isEditing ? (
          <>
            <EditableContactField 
              icon={Phone} 
              label="Phone" 
              value={card.phone} 
              fieldName="phone"
              onUpdateField={onUpdateField} 
            />
            <EditableContactField 
              icon={Smartphone} 
              label="Mobile" 
              value={card.mobile} 
              fieldName="mobile"
              onUpdateField={onUpdateField} 
            />
            <EditableContactField 
              icon={Mail} 
              label="Email" 
              value={card.email} 
              fieldName="email"
              onUpdateField={onUpdateField} 
            />
            <EditableContactField 
              icon={Globe} 
              label="Website" 
              value={card.website} 
              fieldName="website"
              onUpdateField={onUpdateField} 
            />
            <EditableContactField 
              icon={MapPin} 
              label="Address" 
              value={card.address} 
              fieldName="address"
              onUpdateField={onUpdateField} 
            />
            <EditableContactField 
              icon={Linkedin} 
              label="LinkedIn" 
              value={card.linkedinUrl} 
              fieldName="linkedinUrl"
              onUpdateField={onUpdateField} 
            />
          </>
        ) : (
          <>
            <ContactAction 
              icon={Phone} 
              label="Phone" 
              value={card.phone} 
              href={card.phone ? `tel:${card.phone}` : undefined} 
            />
            <ContactAction 
              icon={Smartphone} 
              label="Mobile" 
              value={card.mobile} 
              href={card.mobile ? `tel:${card.mobile}` : undefined} 
            />
            <ContactAction 
              icon={Mail} 
              label="Email" 
              value={card.email} 
              href={card.email ? `mailto:${card.email}` : undefined} 
            />
            <ContactAction 
              icon={Globe} 
              label="Website" 
              value={card.website} 
              href={card.website ? `https://${card.website.replace(/^https?:\/\//,'')}` : undefined} 
            />
            <ContactAction 
              icon={MapPin} 
              label="Address" 
              value={card.address} 
              href={card.address ? `https://maps.google.com/?q=${encodeURIComponent(card.address)}` : undefined} 
            />
            <ContactAction 
              icon={Linkedin} 
              label="LinkedIn" 
              value={card.linkedinUrl} 
              href={card.linkedinUrl ? (card.linkedinUrl.startsWith('http') ? card.linkedinUrl : `https://${card.linkedinUrl}`) : undefined} 
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CardContactInfo;
