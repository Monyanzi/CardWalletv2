import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // Changed from QRCodeSVG to QRCodeCanvas
import { Card } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Download } from '../utils/icons';

interface QRCodeGeneratorProps {
  card: Card;
  size?: number;
  showDownload?: boolean;
  showFeedback?: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  card, 
  size = 200,
  showDownload = true,
  showFeedback
}) => {
  const { darkMode } = useTheme();
  
  // Generate vCard format data
  const generateVCardData = () => {
    let vCardData = 'BEGIN:VCARD\nVERSION:3.0\n';
    
    // Add name
    vCardData += `N:${card.name.split(' ').slice(-1)[0]};${card.name.split(' ').slice(0, -1).join(' ')};;;\n`;
    vCardData += `FN:${card.name}\n`;
    
    // Add organization
    if (card.company) {
      vCardData += `ORG:${card.company}\n`;
    }
    
    // Add title/position
    if (card.position) {
      vCardData += `TITLE:${card.position}\n`;
    }
    
    // Add phone numbers
    if (card.phone) {
      vCardData += `TEL;TYPE=WORK,VOICE:${card.phone}\n`;
    }
    if (card.mobile) {
      vCardData += `TEL;TYPE=CELL,VOICE:${card.mobile}\n`;
    }
    
    // Add email
    if (card.email) {
      vCardData += `EMAIL;TYPE=WORK,INTERNET:${card.email}\n`;
    }
    
    // Add website
    if (card.website) {
      vCardData += `URL;TYPE=WORK:${card.website}\n`;
    }
    
    // Add LinkedIn
    if (card.linkedinUrl) {
      vCardData += `URL;TYPE=SOCIAL:${card.linkedinUrl}\n`;
    }
    
    // Add address
    if (card.address) {
      vCardData += `ADR;TYPE=WORK:;;${card.address};;;;\n`;
    }
    
    vCardData += 'END:VCARD';
    return vCardData;
  };
  
  const vCardData = generateVCardData();
  
  // Function to download QR code as PNG
  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (!canvas) {
      if (showFeedback) {
        showFeedback("QR code canvas element not found.", "error");
      } else {
        console.error("QR code canvas element not found.");
      }
      return;
    }

    try {
      const pngUrl = canvas.toDataURL('image/png');
      // .replace('image/png', 'image/octet-stream'); // replace is not needed for modern browsers to force download with dataURL. The download attribute handles it.
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      const filename = `${(card.name || card.company || 'card').replace(/\s+/g, '-').toLowerCase()}-qrcode.png`;
      downloadLink.download = filename;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      if (showFeedback) {
        showFeedback("QR code download started.", "success");
      }

    } catch (error) {
      console.error("Failed to download QR code:", error);
      if (showFeedback) {
        showFeedback("Failed to download QR code. Please try again.", "error");
      }
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`p-4 rounded-lg ${darkMode ? 'bg-white' : 'bg-white'} shadow-md`} // Ensure bg is white for canvas
      >
        <QRCodeCanvas // Changed from QRCodeSVG
          id="qr-code-canvas" // ID for referencing the canvas
          value={vCardData} 
          size={size} 
          bgColor={"#ffffff"} 
          fgColor={"#000000"} 
          level={"H"} 
          // includeMargin={true} // includeMargin is an SVG concept, canvas renders what's given by size
        />
      </div>
      
      {showDownload && (
        <button
          onClick={downloadQRCode}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <Download size={16} />
          <span>Download QR Code</span>
        </button>
      )}
      
      <p className={`text-sm mt-3 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Scan to add {card.name} to your contacts
      </p>
    </div>
  );
};

export default QRCodeGenerator;
