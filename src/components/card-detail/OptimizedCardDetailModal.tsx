import React, { useState, lazy, Suspense } from 'react';
import { ArrowLeft, X, Save } from '../../utils/icons';
import { Card, SelectOption } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import Modal from '../ui/Modal';
import IconButton from '../ui/IconButton';
import { QRCodeSVG } from 'qrcode.react';

// Lazy loaded components
const BusinessCardDetails = lazy(() => import('./BusinessCardDetails'));
const NonBusinessCardDetails = lazy(() => import('./NonBusinessCardDetails'));
const CardContactInfo = lazy(() => import('./CardContactInfo'));
const CardDetailActions = lazy(() => import('./CardDetailActions'));
const QRCodeGenerator = lazy(() => import('../QRCodeGenerator'));
const OptimizedCodeScanner = lazy(() => import('../OptimizedCodeScanner'));

interface CardDetailModalProps {
  card: Card;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (cardOrId: Card | number) => void;
  onShare: (card: Card) => void;
  onSaveToContacts: () => void;
  isEditing: boolean;
  onEditToggle: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onUpdateField: (fieldName: string, value: string | boolean) => void;
  onColorChange: (color: string) => void;
  cardTypes: SelectOption[];
}

const OptimizedCardDetailModal: React.FC<CardDetailModalProps> = ({
  card,
  isOpen,
  onClose,
  onDelete,
  onShare,
  onSaveToContacts,
  isEditing,
  onEditToggle,
  onSaveEdit,
  onCancelEdit,
  onUpdateField
}) => {
  const { darkMode } = useTheme();
  
  // Simple local state for UI purposes only
  const [showQRCode, setShowQRCode] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  
  const modalTitle = isEditing 
    ? 'Edit Card' 
    : (card.name || card.company || 'Card Details');
  
  const handleScanSuccess = (data: string, type: 'qr' | 'barcode') => {
    onUpdateField(type === 'qr' ? 'qrCodeData' : 'barcodeData', data);
    showFeedback(`${type === 'qr' ? 'QR' : 'Barcode'} data scanned successfully!`);
    setShowScanner(false);
  };
  
  // Show feedback message
  const showFeedback = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) => {
    // Create a temporary div for feedback
    const feedbackDiv = document.createElement('div');
    let bgColor = 'bg-blue-600'; // Default for info
    if (type === 'success') bgColor = 'bg-green-500';
    if (type === 'error') bgColor = 'bg-red-500';
    if (type === 'warning') bgColor = 'bg-yellow-500';

    feedbackDiv.className = `fixed bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 ${bgColor} text-white rounded-md shadow-lg z-[10000]`; // Increased z-index
    feedbackDiv.textContent = message;
    document.body.appendChild(feedbackDiv);
    
    // Remove after specified duration
    setTimeout(() => {
      feedbackDiv.style.opacity = '0';
      feedbackDiv.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => {
        if (document.body.contains(feedbackDiv)) {
          document.body.removeChild(feedbackDiv);
        }
      }, 500); // Wait for fade out animation
    }, duration);
  };
  
  // Return null early if modal is closed
  if (!isOpen) return null;
  
  // Content loader fallback
  const LoadingFallback = () => (
    <div className={`p-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      Loading content...
    </div>
  );
  
  // Render modal header
  const renderHeader = () => (
    <div className="flex items-center justify-between">
      {isEditing ? (
        <>
          {/* REMOVED Cancel button */}
          {/* <button
            onClick={onCancelEdit}
            className={`px-3 py-1 rounded-md text-sm font-medium ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Cancel
          </button> */}
          {/* Added invisible spacer to maintain title centering */}
          <div style={{ width: 'auto', minWidth: '32px' }} aria-hidden="true"></div>
          <h3 className="text-lg font-semibold truncate flex-1 text-center mx-2" title={modalTitle}>{modalTitle}</h3>
          <IconButton icon={X} onClick={onClose} label="Close" variant="secondary" />
        </>
      ) : (
        <>
          <IconButton icon={ArrowLeft} onClick={onClose} label="Back" variant="secondary" />
          <h3 className="text-lg font-semibold truncate flex-1 text-center mx-2" title={modalTitle}>{modalTitle}</h3>
          <Suspense fallback={<div style={{ width: 'auto', minWidth: '32px' }} />}>
            <CardDetailActions
              card={card}
              onEditToggle={onEditToggle}
              onShare={onShare}
              onSaveToContacts={onSaveToContacts}
              onShowQRCode={() => {
                // For business cards or cards with QR data, show QR code
                if (card.isMyCard || card.type === 'business' || card.qrCodeData) {
                  setShowQRCode(true);
                  setShowBarcode(false);
                } else {
                  // For non-business cards without QR data but with barcode data, show barcode
                  setShowBarcode(true);
                  setShowQRCode(false);
                }
              }}
              onShowScanner={() => {
                setShowScanner(true);
                setShowQRCode(false);
                setShowBarcode(false);
              }}
              onDelete={onDelete}
            />
          </Suspense>
        </>
      )}
    </div>
  );
  
  // Render modal footer
  const renderFooter = () => (
    isEditing ? (
      <div className="flex justify-end space-x-2">
        <button
          className={`px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          onClick={onCancelEdit}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
          onClick={onSaveEdit}
        >
          <Save size={16} /> Save Changes
        </button>
      </div>
    ) : (
      <div className="flex justify-between">
        <button
          className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          onClick={() => onDelete(card)}
        >
          Delete Card
        </button>
      </div>
    )
  );
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={isEditing ? onCancelEdit : onClose}
      title={modalTitle} // Pass modalTitle to the generic Modal's title prop
      showCloseButton={false} // Keep false as OptimizedCardDetailModal renders its own header controls
      className="w-full max-w-md"
    >
      <div className="p-4">
        {renderHeader()}
      </div>
      
      <div className="p-4">
        {/* Card Content */}
        {showQRCode ? (
          <Suspense fallback={<LoadingFallback />}>
            {/* For business cards, show vCard QR code */}
            {(card.isMyCard || card.type === 'business') ? (
              <>
                <h3 className="text-center font-medium mb-4">Business Card QR Code</h3>
                <QRCodeGenerator card={card} showFeedback={showFeedback} />
              </>
            ) : (
              /* For non-business cards with QR data, show that data as QR */
              <>
                <h3 className="text-center font-medium mb-4">Card QR Code</h3>
                <div className="flex flex-col items-center">
                  <div className="p-4 rounded-lg bg-white shadow-md">
                    <QRCodeSVG
                      value={JSON.stringify(card)}
                      size={200}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"H"}
                      includeMargin={true}
                    />
                  </div>
                  <p className="text-sm mt-3 text-center">
                    {card.qrCodeData ? 'Scanned QR Code' : 'Generated QR Code'}
                  </p>
                </div>
              </>
            )}
            <button 
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 w-full"
              onClick={() => setShowQRCode(false)}
            >
              Close QR Code
            </button>
          </Suspense>
        ) : showBarcode ? (
          <Suspense fallback={<LoadingFallback />}>
            <h3 className="text-center font-medium mb-4">Card Barcode</h3>
            <div className="flex flex-col items-center">
              <div className="p-4 rounded-lg bg-white shadow-md">
                {/* Simple barcode display using CSS */}
                <div className="w-64 h-32 flex flex-col justify-center items-center">
                  <div className="w-full h-16 bg-contain bg-no-repeat bg-center" 
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' height='100' width='200'%3E%3Cg fill='%23000000'%3E%3Crect x='5' y='10' width='2' height='80'/%3E%3Crect x='12' y='10' width='1' height='80'/%3E%3Crect x='18' y='10' width='3' height='80'/%3E%3Crect x='25' y='10' width='2' height='80'/%3E%3Crect x='32' y='10' width='4' height='80'/%3E%3Crect x='40' y='10' width='1' height='80'/%3E%3Crect x='46' y='10' width='3' height='80'/%3E%3Crect x='53' y='10' width='2' height='80'/%3E%3Crect x='60' y='10' width='4' height='80'/%3E%3Crect x='68' y='10' width='1' height='80'/%3E%3Crect x='74' y='10' width='3' height='80'/%3E%3Crect x='81' y='10' width='2' height='80'/%3E%3Crect x='88' y='10' width='4' height='80'/%3E%3Crect x='96' y='10' width='1' height='80'/%3E%3Crect x='102' y='10' width='3' height='80'/%3E%3Crect x='109' y='10' width='2' height='80'/%3E%3Crect x='116' y='10' width='4' height='80'/%3E%3Crect x='124' y='10' width='1' height='80'/%3E%3Crect x='130' y='10' width='3' height='80'/%3E%3Crect x='137' y='10' width='2' height='80'/%3E%3Crect x='144' y='10' width='4' height='80'/%3E%3Crect x='152' y='10' width='1' height='80'/%3E%3Crect x='158' y='10' width='3' height='80'/%3E%3Crect x='165' y='10' width='2' height='80'/%3E%3Crect x='172' y='10' width='4' height='80'/%3E%3Crect x='180' y='10' width='1' height='80'/%3E%3Crect x='186' y='10' width='3' height='80'/%3E%3Crect x='193' y='10' width='2' height='80'/%3E%3C/g%3E%3C/svg%3E")`
                    }}
                  ></div>
                  <div className="text-xs mt-2 text-center font-mono">
                    {card.barcodeData || `ID-${card.id}`}
                  </div>
                </div>
              </div>
              <p className="text-sm mt-3 text-center">
                {card.barcodeData ? 'Scanned Barcode' : 'Generated Barcode'}
              </p>
            </div>
            <button 
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 w-full"
              onClick={() => setShowBarcode(false)}
            >
              Close Barcode
            </button>
          </Suspense>
        ) : showScanner ? (
          <Suspense fallback={<LoadingFallback />}>
            <OptimizedCodeScanner
              onClose={() => setShowScanner(false)}
              onScanSuccess={handleScanSuccess}
            />
          </Suspense>
        ) : (
          <div className="space-y-6">
            {/* Card basic details */}
            <Suspense fallback={<LoadingFallback />}>
              {card.isMyCard || card.type === 'business' ? (
                <BusinessCardDetails 
                  card={card} 
                  isEditing={isEditing}
                  onUpdateField={onUpdateField}
                />
              ) : (
                <NonBusinessCardDetails 
                  card={card} 
                  isEditing={isEditing}
                  onUpdateField={onUpdateField}
                />
              )}
            </Suspense>
            
            {/* Contact information (if business card) */}
            {(card.isMyCard || card.type === 'business') && (
              <Suspense fallback={<LoadingFallback />}>
                <CardContactInfo 
                  card={card} 
                  isEditing={isEditing}
                  onUpdateField={onUpdateField}
                />
              </Suspense>
            )}
            
            {/* Notes section for all card types */}
            <div className="mt-3">
              {isEditing ? (
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded-lg`}>
                  <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>Notes</h4>
                  <textarea
                    className={`w-full p-2 rounded text-sm ${darkMode ? 'bg-gray-600 text-gray-200' : 'bg-white text-gray-700'} border ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}
                    value={card.notes || ''}
                    rows={3}
                    onChange={(e) => onUpdateField && onUpdateField('notes', e.target.value)}
                    placeholder="Add notes here..."
                  />
                </div>
              ) : card.notes ? (
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-3 rounded-lg`}>
                  <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-1`}>Notes</h4>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{card.notes}</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
      
      {!showQRCode && !showScanner && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {renderFooter()}
        </div>
      )}
    </Modal>
  );
};

export default OptimizedCardDetailModal;
