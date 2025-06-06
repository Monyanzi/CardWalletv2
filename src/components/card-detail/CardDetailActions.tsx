import React, { useState } from 'react';
import { Share2, Edit2, Download, QrCode, Scan, Trash2, Barcode } from '../../utils/icons';
import { Card } from '../../types';
import IconButton from '../ui/IconButton';
import ConfirmationDialog from '../ConfirmationDialog';

interface CardDetailActionsProps {
  card: Card;
  onEditToggle: () => void;
  onShare: (card: Card) => void;
  onSaveToContacts: () => void;
  onShowQRCode: () => void;
  onShowScanner: () => void;
  onDelete: (cardOrId: Card | number) => void;
}

const CardDetailActions: React.FC<CardDetailActionsProps> = ({
  card,
  onEditToggle,
  onShare,
  onSaveToContacts,
  onShowQRCode,
  onShowScanner,
  onDelete
}) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true);
  };
  
  const handleConfirmDelete = () => {
    onDelete(card);
    setIsDeleteConfirmOpen(false);
  };
  
  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
  };
  return (
    <div className="flex items-center space-x-2">
      <IconButton
        icon={Download}
        onClick={onSaveToContacts}
        label="Save to Contacts"
        variant="secondary"
      />
      
      <IconButton
        icon={Share2}
        onClick={() => onShare(card)}
        label="Share Card"
        variant="secondary"
      />
      
      {/* For my business cards: Show QR Code */}
      {card.isMyCard && (
        <IconButton
          icon={QrCode}
          onClick={onShowQRCode}
          label="Show QR Code"
          variant="secondary"
        />
      )}
      
      {/* For other business cards: Scan Code */}
      {!card.isMyCard && card.type === 'business' && (
        <IconButton
          icon={Scan}
          onClick={onShowScanner}
          label="Scan Code"
          variant="secondary"
        />
      )}
      
      {/* For non-business cards: Show Barcode or QR Code */}
      {card.type !== 'business' && (
        <>
          {/* Show Barcode button if no QR code data exists or barcode data exists */}
          {(!card.qrCodeData || card.barcodeData) && (
            <IconButton
              icon={Barcode}
              onClick={onShowQRCode}
              label={card.barcodeData ? "Show Barcode" : "Generate Barcode"}
              variant="secondary"
            />
          )}
          
          {/* Show QR Code button if QR code data exists */}
          {card.qrCodeData && (
            <IconButton
              icon={QrCode}
              onClick={onShowQRCode}
              label="Show QR Code"
              variant="secondary"
            />
          )}
          
          {/* Always show Scan button for non-business cards */}
          <IconButton
            icon={Scan}
            onClick={onShowScanner}
            label="Scan Code"
            variant="secondary"
          />
        </>
      )}
      
      <IconButton
        icon={Edit2}
        onClick={onEditToggle}
        label="Edit Card"
        variant="primary"
      />
      
      <IconButton
        icon={Trash2}
        onClick={handleDeleteClick}
        label="Delete Card"
        variant="danger"
        aria-label="Delete Card"
      />
      
      <ConfirmationDialog
        isOpen={isDeleteConfirmOpen}
        title="Delete Card"
        message={`Are you sure you want to delete ${card.name}'s card? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDestructive={true}
      />
    </div>
  );
};

export default CardDetailActions;
