import React, { lazy, Suspense } from 'react';
import { Card } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { DetailItem } from './NonBusinessCardDetails';
import { EditableDetailItem } from './NonBusinessCardDetails';

// Import CheckboxField component
const CheckboxField = lazy(() => import('../forms/CheckboxField'));

interface BusinessCardDetailsProps {
  card: Card;
  isEditing?: boolean;
  onUpdateField?: (fieldName: string, value: string | boolean) => void;
}

const BusinessCardDetails: React.FC<BusinessCardDetailsProps> = ({ card, isEditing = false, onUpdateField }) => {
  const { darkMode } = useTheme();
  
  if (!card) return null;
  
  return (
    <div className="space-y-3">
      {isEditing ? (
        <>
          <Suspense fallback={<div>Loading...</div>}>
            <CheckboxField
              label="This is my business card"
              name="isMyCard"
              checked={card.isMyCard || false}
              onChange={(e) => {
                if (onUpdateField) {
                  // Update the isMyCard field - This triggers the hook logic to handle type
                  onUpdateField('isMyCard', e.target.checked);
                }
              }}
            />
          </Suspense>
          <EditableDetailItem 
            label="Name" 
            value={card.name} 
            fieldName="name"
            onUpdateField={onUpdateField} 
          />
          <EditableDetailItem 
            label="Company" 
            value={card.company} 
            fieldName="company"
            onUpdateField={onUpdateField} 
          />
          <EditableDetailItem 
            label="Position" 
            value={card.position} 
            fieldName="position"
            onUpdateField={onUpdateField} 
          />
          <EditableDetailItem 
            label="Department" 
            value={card.department || ''} 
            fieldName="department"
            onUpdateField={onUpdateField} 
          />
        </>
      ) : (
        <>
          {card.isMyCard && (
            <div className={`mb-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded-lg`}>
              <p className="text-sm font-medium">
                <span className="inline-block px-2 py-1 bg-blue-600 text-white rounded-md mr-2">✓</span>
                This is my business card
              </p>
            </div>
          )}
          <DetailItem label="Name" value={card.name} />
          <DetailItem label="Company" value={card.company} />
          <DetailItem label="Position" value={card.position} />
          
          {card.department && <DetailItem label="Department" value={card.department} />}
        </>
      )}
    </div>
  );
};

export default BusinessCardDetails;
