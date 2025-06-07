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
  // State to track if a submission attempt has been made.
  // This is used to trigger error visibility on all fields if the form is submitted with invalid data.
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Initialize local state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setShowCustomType(false);
      setFormSubmitted(false); // Reset submit attempt state when modal opens
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
    // Marking field as touched is no longer handled by this modal's state.
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
    // Core field presence checks
    if (isBusinessCardType) {
      if (!newCard.name || !newCard.company) return false;
    } else {
      if (!newCard.company) return false;
    }

    // Specific validation function checks for relevant fields
    // These functions return an error string if invalid, null if valid or not applicable
    if (validateEmail(newCard.email || '') !== null) return false;
    if (validateUrl(newCard.website || '') !== null) return false;
    if (validateUrl(newCard.linkedinUrl || '') !== null) return false; // Assuming linkedinUrl uses the same URL validation
    if (validatePhone(newCard.phone || '') !== null) return false;
    if (validatePhone(newCard.mobile || '') !== null) return false;

    return true; // All checks passed
  }, [isBusinessCardType, newCard, validateEmail, validateUrl, validatePhone]); // Added newCard and validation functions to dependency array
  
  // Handle form submission
  const handleSubmit = () => {
    // Mark that a submission attempt has been made.
    // This will trigger validation messages on fields that haven't been touched yet
    // by passing forceShowError={true} to them.
    setFormSubmitted(true);

    if (requiredFieldsFilled()) {
      onAddCard(); // Proceed with adding the card if all validations pass
      // formSubmitted will be reset by the useEffect hook when the modal closes or reopens.
    } else {
      // Log for debugging; actual user feedback is through field-level error messages.
      console.log("Form is invalid. Please check the fields. Errors should now be visible.");
    }
  };

  // Custom onClose handler for the Modal component.
  // Ensures formSubmitted state is reset when the modal is explicitly closed.
  const handleCloseModal = () => {
    setFormSubmitted(false); // Reset submission attempt state
    onClose(); // Call the original onClose handler
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal} // Use custom handler
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
                forceShowError={formSubmitted} // Pass submit attempt state
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
                    forceShowError={formSubmitted} // Pass submit attempt state
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
                    forceShowError={formSubmitted} // Pass submit attempt state
                  />
                  <InputField
                    label="Position"
                    name="position"
                    value={newCard.position}
                    onChange={handleInputChange}
                    placeholder="(Optional) Job title"
                    forceShowError={formSubmitted}
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={newCard.email}
                    onChange={handleInputChange}
                    placeholder="(Optional) Email address"
                    validate={validateEmail}
                    forceShowError={formSubmitted}
                  />
                  <InputField
                    label="Phone"
                    name="phone"
                    type="tel"
                    value={newCard.phone}
                    onChange={handleInputChange}
                    placeholder="(Optional) Phone number"
                    validate={validatePhone}
                    forceShowError={formSubmitted}
                  />
                  <InputField
                    label="Mobile"
                    name="mobile"
                    type="tel"
                    value={newCard.mobile}
                    onChange={handleInputChange}
                    placeholder="(Optional) Mobile number"
                    validate={validatePhone}
                    forceShowError={formSubmitted}
                  />
                  <InputField
                    label="Website"
                    name="website"
                    type="url"
                    value={newCard.website}
                    onChange={handleInputChange}
                    placeholder="(Optional) www.example.com"
                    validate={validateUrl}
                    forceShowError={formSubmitted}
                  />
                  <InputField
                    label="LinkedIn Profile URL"
                    name="linkedinUrl"
                    type="url"
                    value={newCard.linkedinUrl || ''}
                    onChange={handleInputChange}
                    placeholder="(Optional) linkedin.com/in/yourprofile"
                    validate={validateUrl}
                    forceShowError={formSubmitted}
                  />
                  <InputField
                    label="Address"
                    name="address"
                    value={newCard.address}
                    onChange={handleInputChange}
                    placeholder="(Optional) Street address"
                    forceShowError={formSubmitted}
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
                    forceShowError={formSubmitted} // Pass submit attempt state
                  />
                  <InputField
                    label="Identifier / Member No."
                    name="identifier"
                    value={newCard.identifier}
                    onChange={handleInputChange}
                    placeholder="(Optional)"
                    forceShowError={formSubmitted}
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
                  forceShowError={formSubmitted} // Pass submit attempt state
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
