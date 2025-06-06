import React from 'react';
import { Card } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface DetailItemProps {
  label: string;
  value?: string | null;
  isLink?: boolean;
  href?: string;
}

interface EditableDetailItemProps {
  label: string;
  value?: string | null;
  fieldName: string;
  onUpdateField?: (fieldName: string, value: string | boolean) => void;
}

export const DetailItem: React.FC<DetailItemProps> = ({ 
  label, 
  value, 
  isLink = false,
  href
}) => {
  const { darkMode } = useTheme();
  
  if (!value) return null;
  
  const content = (
    <>
      <dt className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</dt>
      <dd className="font-medium">{value}</dd>
    </>
  );
  
  if (isLink && href) {
    return (
      <div className="py-1">
        <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:underline text-blue-500">
          {content}
        </a>
      </div>
    );
  }
  
  return <div className="py-1">{content}</div>;
};

export const EditableDetailItem: React.FC<EditableDetailItemProps> = ({
  label,
  value,
  fieldName,
  onUpdateField
}) => {
  const { darkMode } = useTheme();
  
  return (
    <div className="py-1">
      <label className={`block text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {label}
      </label>
      <input
        type="text"
        className={`w-full p-2 mt-1 rounded text-sm ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-700'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
        value={value || ''}
        onChange={(e) => onUpdateField && onUpdateField(fieldName, e.target.value)}
      />
    </div>
  );
};

interface NonBusinessCardDetailsProps {
  card: Card;
  isEditing?: boolean;
  onUpdateField?: (fieldName: string, value: string | boolean) => void;
}

const NonBusinessCardDetails: React.FC<NonBusinessCardDetailsProps> = ({ card, isEditing = false, onUpdateField }) => {
  const { darkMode } = useTheme();
  
  if (!card) return null;
  
  return (
    <div className="space-y-3">
      {isEditing ? (
        <>
          <EditableDetailItem 
            label="Company/Club" 
            value={card.company} 
            fieldName="company"
            onUpdateField={onUpdateField} 
          />
          <EditableDetailItem 
            label="Identifier" 
            value={card.identifier || ''} 
            fieldName="identifier"
            onUpdateField={onUpdateField} 
          />
          <EditableDetailItem 
            label="Website" 
            value={card.website || ''} 
            fieldName="website"
            onUpdateField={onUpdateField} 
          />
          
          {card.type === 'reward' && (
            <EditableDetailItem 
              label="Reward Points/Balance" 
              value={card.balance || ''} 
              fieldName="balance"
              onUpdateField={onUpdateField} 
            />
          )}
          
          {(card.type === 'reward' || card.type === 'membership' || card.type === 'ticket' || card.type === 'other') && (
            <EditableDetailItem 
              label="Expiry Date" 
              value={card.expiry || ''} 
              fieldName="expiry"
              onUpdateField={onUpdateField} 
            />
          )}
          
          {card.type === 'ticket' && (
            <div className={`mt-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded-lg space-y-2`}>
              <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>Event Information</h4>
              <EditableDetailItem 
                label="Date" 
                value={card.date || ''} 
                fieldName="date"
                onUpdateField={onUpdateField} 
              />
              <EditableDetailItem 
                label="Time" 
                value={card.time || ''} 
                fieldName="time"
                onUpdateField={onUpdateField} 
              />
              <EditableDetailItem 
                label="Venue" 
                value={card.venue || ''} 
                fieldName="venue"
                onUpdateField={onUpdateField} 
              />
              <EditableDetailItem 
                label="Seat" 
                value={card.seat || ''} 
                fieldName="seat"
                onUpdateField={onUpdateField} 
              />
            </div>
          )}
        </>
      ) : (
        <>
          <DetailItem label="Company/Club" value={card.company} />
          <DetailItem label="Identifier" value={card.identifier} />
          
          {card.website && (
            <DetailItem 
              label="Website" 
              value={card.website} 
              isLink 
              href={`https://${card.website.replace(/^https?:\/\//,'')}`} 
            />
          )}
          
          {card.type === 'reward' && <DetailItem label="Reward Points/Balance" value={card.balance} />}
          
          {(card.type === 'reward' || card.type === 'membership' || card.type === 'ticket' || card.type === 'other') && (
            <DetailItem label="Expiry Date" value={card.expiry} />
          )}
          
          {card.type === 'ticket' && (
            <div className={`mt-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded-lg space-y-1`}>
              <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>Event Information</h4>
              {card.date && <DetailItem label="Date" value={card.date} />}
              {card.time && <DetailItem label="Time" value={card.time} />}
              {card.venue && <DetailItem label="Venue" value={card.venue} />}
              {card.seat && <DetailItem label="Seat" value={card.seat} />}
            </div>
          )}
          
          {/* Scanned QR/Barcode data section */}
          {(card.barcodeData || card.qrCodeData) && (
            <div className={`mt-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded-lg`}>
              <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>Scanned Code Data</h4>
              {card.barcodeData && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Barcode:</p>
                  <div className="bg-white p-2 rounded mt-1 overflow-x-auto">
                    <code className="text-sm text-gray-800">{card.barcodeData}</code>
                  </div>
                </div>
              )}
              {card.qrCodeData && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">QR Code:</p>
                  <div className="bg-white p-2 rounded mt-1 overflow-x-auto">
                    <code className="text-sm text-gray-800">{card.qrCodeData}</code>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NonBusinessCardDetails;
