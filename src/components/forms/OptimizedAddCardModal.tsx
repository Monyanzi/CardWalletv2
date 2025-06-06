import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Camera } from '../../utils/icons';
import { SelectOption } from '../../types';
import { PS5_BLUE, AVAILABLE_COLORS } from '../../utils/constants';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

// Import form components dynamically
const InputField = lazy(() => import('./InputField'));
const SelectField = lazy(() => import('./SelectField'));
const CheckboxField = lazy(() => import('./CheckboxField'));

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: () => void;
  isScanning: boolean;
  onScanToggle: (scanning: boolean) => void;
  onSimulateScan: () => void;
  newCard: any;
  onNewCardChange: (updatedCard: any) => void;
  cardTypes: SelectOption[];
}

const OptimizedAddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  onAddCard,
  isScanning,
  onScanToggle,
  onSimulateScan,
  newCard,
  onNewCardChange,
  cardTypes
}) => {
  const { darkMode } = useTheme();
  const [showCustomType, setShowCustomType] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formTouched, setFormTouched] = useState<Record<string, boolean>>({});
  
  // Initialize local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowCustomType(false);
      setFormErrors({});
      setFormTouched({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onNewCardChange({
      ...newCard,
      [name]: value,
    });
    
    // Mark field as touched
    if (!formTouched[name]) {
      setFormTouched(prev => ({ ...prev, [name]: true }));
    }
  };
  
  // Dedicated handler for checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    // Create a new card object with updated checkbox state
    const updatedCard = { ...newCard, [name]: checked };
    
    // If this is the isMyCard checkbox and it's checked, set type to business
    if (name === 'isMyCard' && checked) {
      updatedCard.type = 'business';
    }
    
    onNewCardChange(updatedCard);
  };

  const handleColorChange = (color: string) => {
    onNewCardChange({ ...newCard, color });
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomType(true);
      onNewCardChange({ ...newCard, type: '' });
    } else {
      setShowCustomType(false);
      const finalType = newCard.isMyCard ? 'business' : value;
      onNewCardChange({ ...newCard, type: finalType });
    }
  };

  const isBusinessCardType = newCard.type === 'business' || newCard.isMyCard;
  
  // Email validation function
  const validateEmail = useCallback((value: string) => {
    if (!value) return null; // Not required
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Please enter a valid email address';
  }, []);
  
  // URL validation function
  const validateUrl = useCallback((value: string) => {
    if (!value) return null; // Not required
    return /^(https?:\/\/)?(www\.)?[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/.test(value) 
      ? null 
      : 'Please enter a valid URL';
  }, []);
  
  // Phone validation function
  const validatePhone = useCallback((value: string) => {
    if (!value) return null; // Not required
    return /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value.replace(/\s/g, '')) 
      ? null 
      : 'Please enter a valid phone number';
  }, []);
  
  // Check if required fields are filled and valid
  const requiredFieldsFilled = useCallback(() => {
    // Check for validation errors
    const hasErrors = Object.keys(formErrors).some(key => !!formErrors[key]);
    if (hasErrors) return false;
    
    // Check required fields
    if (isBusinessCardType) {
      return !!newCard.name && !!newCard.company;
    }
    return !!newCard.company; // For non-business cards
  }, [isBusinessCardType, newCard.name, newCard.company, formErrors]);
  
  // Handle form submission
  const handleSubmit = () => {
    // Check all required fields are filled and valid
    const requiredFields = isBusinessCardType ? ['name', 'company'] : ['company'];
    
    // Mark all required fields as touched
    const newTouched = { ...formTouched };
    requiredFields.forEach(field => {
      newTouched[field] = true;
    });
    setFormTouched(newTouched);
    
    if (requiredFieldsFilled()) {
      onAddCard();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Card"
      footer={
        isScanning ? (
          <Button
            onClick={() => onScanToggle(false)}
            variant="secondary"
            fullWidth
          >
            Cancel Scan
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => onScanToggle(true)}
              variant="secondary"
              className="flex items-center justify-center gap-1"
            >
              <Camera size={20} />
              <span>Scan Card</span>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!requiredFieldsFilled()}
              className={`${!requiredFieldsFilled() ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{ backgroundColor: PS5_BLUE }}
              fullWidth
              aria-label="Add card to wallet"
            >
              Add Card
            </Button>
          </div>
        )
      }
    >
      <div className="p-4">
        <Suspense fallback={<div>Loading form...</div>}>
          {isScanning ? (
            <div className="text-center py-6">
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                Scanning card...
              </p>
              <div className="animate-pulse flex justify-center">
                <div className={`${darkMode ? 'bg-gray-600' : 'bg-gray-300'} h-32 w-48 rounded-lg`}></div>
              </div>
              <p className="text-sm mt-4 text-gray-500">
                Position the card in front of your camera
              </p>
              <Button
                onClick={onSimulateScan}
                className="mt-4"
                variant="secondary"
              >
                Simulate Scan Results
              </Button>
            </div>
          ) : (
            <>
              {/* Card Type at the top */}
              <SelectField
                label="Card Type"
                name="type"
                value={newCard.type}
                onChange={handleTypeChange}
                options={cardTypes}
                placeholder="Select card type"
                required
              />
              
              {/* My Card Checkbox - always visible */}
              <CheckboxField
                label="This is my business card"
                name="isMyCard"
                checked={newCard.isMyCard || false}
                onChange={handleCheckboxChange}
                description="Select this if this card belongs to you"
              />
              
              {/* Fields based on card type */}
              {isBusinessCardType ? (
                <>
                  <InputField
                    label="Name"
                    name="name"
                    value={newCard.name}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    required
                    minLength={2}
                    maxLength={50}
                  />
                  <InputField
                    label="Company"
                    name="company"
                    value={newCard.company}
                    onChange={handleInputChange}
                    placeholder="Company name"
                    required
                    minLength={2}
                    maxLength={50}
                  />
                  <InputField
                    label="Position"
                    name="position"
                    value={newCard.position}
                    onChange={handleInputChange}
                    placeholder="(Optional) Job title"
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={newCard.email}
                    onChange={handleInputChange}
                    placeholder="(Optional) Email address"
                    validate={validateEmail}
                  />
                  <InputField
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={newCard.phone}
                    onChange={handleInputChange}
                    placeholder="(Optional) Phone number"
                    validate={validatePhone}
                  />
                  <InputField
                    label="Mobile"
                    name="mobile"
                    type="tel"
                    value={newCard.mobile}
                    onChange={handleInputChange}
                    placeholder="(Optional) Mobile number"
                    validate={validatePhone}
                  />
                  <InputField
                    label="Website"
                    name="website"
                    type="url"
                    value={newCard.website}
                    onChange={handleInputChange}
                    placeholder="(Optional) www.example.com"
                    validate={validateUrl}
                  />
                  <InputField
                    label="LinkedIn Profile URL"
                    name="linkedinUrl"
                    type="url"
                    value={newCard.linkedinUrl || ''}
                    onChange={handleInputChange}
                    placeholder="(Optional) linkedin.com/in/yourprofile"
                    validate={validateUrl}
                  />
                  <InputField
                    label="Address"
                    name="address"
                    value={newCard.address}
                    onChange={handleInputChange}
                    placeholder="(Optional) Street address"
                  />
                </>
              ) : (
                <>
                  <InputField
                    label="Company / Club Name"
                    name="company"
                    value={newCard.company}
                    onChange={handleInputChange}
                    placeholder="e.g., City Books, Fitness Plus"
                    required
                    minLength={2}
                    maxLength={50}
                  />
                  <InputField
                    label="Identifier / Member No."
                    name="identifier"
                    value={newCard.identifier}
                    onChange={handleInputChange}
                    placeholder="(Optional)"
                  />
                </>
              )}
              
              {/* Custom type input would go here if needed */}
              {showCustomType && (
                <InputField
                  label="Custom Card Type"
                  name="customType"
                  value={newCard.customType || ''}
                  onChange={handleInputChange}
                  placeholder="Enter custom card type"
                />
              )}
              
              {/* Color Picker - common to all cards */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Card Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${newCard.color === color ? (darkMode ? 'border-white' : 'border-blue-500 ring-2 ring-blue-300') : (darkMode ? 'border-gray-600' : 'border-gray-300')} hover:opacity-80 transition-opacity`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </Suspense>
      </div>
    </Modal>
  );
};

export default OptimizedAddCardModal;
