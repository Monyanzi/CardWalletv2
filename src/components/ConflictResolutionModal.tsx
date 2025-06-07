import React from 'react';
import { Card } from '../types';
import Modal from '../ui/Modal'; // Import the generic Modal component

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictPair: { local: Omit<Card, 'id' | 'userId'>; server: Card } | null;
  onResolve: (choice: 'local' | 'server') => void;
}

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  conflictPair,
  onResolve,
}) => {
  if (!isOpen || !conflictPair) return null;

  const { local, server } = conflictPair;

  // Basic display - to be enhanced
  // This function's internal styling might need adjustment later if it clashes with Modal's children padding
  const renderCardDetails = (card: Partial<Card>, title: string) => (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px', flex: 1 }}>
      <h4>{title}</h4>
      <p><strong>Name:</strong> {card.name}</p>
      <p><strong>Company:</strong> {card.company}</p>
      <p><strong>Position:</strong> {card.position}</p>
      <p><strong>Email:</strong> {card.email}</p>
      <p><strong>Phone:</strong> {card.phone}</p>
      {/* Add more fields as necessary */}
    </div>
  );

  const modalContent = (
    <>
      <p className="px-4 py-2"> {/* Added padding similar to Modal header/footer for consistency */}
        A card found locally has a similar version on the server with some differences. Please choose which version to keep.
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '0 1rem' }}> {/* Added horizontal padding */}
        {renderCardDetails(local, 'Local Version (Unsaved)')}
        {renderCardDetails(server, 'Server Version')}
      </div>
    </>
  );

  const modalFooter = (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', width: '100%' }}> {/* Use flex and gap for button spacing */}
      <button onClick={() => onResolve('local')} style={{ padding: '10px 20px' }} className="bg-blue-500 hover:bg-blue-600 text-white rounded">
        Keep Local Version
      </button>
      <button onClick={() => onResolve('server')} style={{ padding: '10px 20px' }} className="bg-blue-500 hover:bg-blue-600 text-white rounded">
        Keep Server Version
      </button>
      <button onClick={onClose} style={{ padding: '10px 20px' }} className="bg-gray-300 hover:bg-gray-400 text-black rounded">
        Decide Later
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Conflict Detected"
      footer={modalFooter}
    >
      {modalContent}
    </Modal>
  );
};

export default ConflictResolutionModal;
