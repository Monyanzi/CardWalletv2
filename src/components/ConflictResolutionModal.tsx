import React from 'react';
import { Card } from '../types';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictPair: { local: Omit<Card, 'id' | 'userId'>; server: Card } | null;
  onResolve: (choice: 'local' | 'server') => void; // Simplified for now
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
  const renderCardDetails = (card: Partial<Card>, title: string) => (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
      <h4>{title}</h4>
      <p><strong>Name:</strong> {card.name}</p>
      <p><strong>Company:</strong> {card.company}</p>
      <p><strong>Position:</strong> {card.position}</p>
      <p><strong>Email:</strong> {card.email}</p>
      <p><strong>Phone:</strong> {card.phone}</p>
      {/* Add more fields as necessary */}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', padding: '20px', borderRadius: '8px',
        minWidth: '400px', maxWidth: '80%', maxHeight: '90%', overflowY: 'auto'
      }}>
        <h2>Conflict Detected</h2>
        <p>A card found locally has a similar version on the server with some differences. Please choose which version to keep.</p>
        
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {renderCardDetails(local, 'Local Version (Unsaved)')}
          {renderCardDetails(server, 'Server Version')}
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={() => onResolve('local')} style={{ marginRight: '10px', padding: '10px 20px' }}>
            Keep Local Version
          </button>
          <button onClick={() => onResolve('server')} style={{ marginRight: '10px', padding: '10px 20px' }}>
            Keep Server Version
          </button>
          {/* <button onClick={() => onResolve('merge')} style={{ marginRight: '10px', padding: '10px 20px' }}>Merge (Advanced)</button> */}
          <button onClick={onClose} style={{ padding: '10px 20px' }}>
            Decide Later (Skips this conflict for now)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionModal;
