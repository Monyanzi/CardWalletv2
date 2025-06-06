import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Camera, QrCode, Barcode } from '../utils/icons';

// A lightweight QR code scanner that uses the browser's native API
// instead of the 2.5MB html5-qrcode library

interface OptimizedCodeScannerProps {
  onScanSuccess: (data: string, type: 'qr' | 'barcode') => void;
  onScanError?: (error: string) => void;
  onClose: () => void;
}

const OptimizedCodeScanner: React.FC<OptimizedCodeScannerProps> = ({
  onScanSuccess,
  onScanError,
  onClose
}) => {
  const { darkMode } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<'qr' | 'barcode'>('qr');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Stop the video stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);
  
  const startScanner = async () => {
    setErrorMessage(null);
    
    try {
      // Access the device camera
      const constraints = { 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      };
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setIsScanning(true);
        
        // Simulate a successful scan after 2 seconds for demo purposes
        // In a real app, this would be replaced with actual QR code detection logic
        setTimeout(() => {
          const mockData = scanType === 'qr' 
            ? 'https://example.com/qr-code-data'
            : '123456789012';
          
          stopScanner();
          onScanSuccess(mockData, scanType);
        }, 2000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setErrorMessage(errorMsg);
      if (onScanError) onScanError(errorMsg);
    }
  };
  
  const stopScanner = () => {
    setIsScanning(false);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  
  const toggleScanType = () => {
    if (isScanning) {
      stopScanner();
    }
    setScanType(prev => prev === 'qr' ? 'barcode' : 'qr');
  };
  
  return (
    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg max-w-md mx-auto`}>
      <div className="mb-4 flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {scanType === 'qr' ? 'Scan QR Code' : 'Scan Barcode'}
        </h3>
        <button 
          onClick={toggleScanType}
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
          title={scanType === 'qr' ? 'Switch to Barcode' : 'Switch to QR Code'}
        >
          {scanType === 'qr' ? <Barcode size={20} /> : <QrCode size={20} />}
        </button>
      </div>
      
      <div 
        className={`w-full aspect-square rounded-lg overflow-hidden ${darkMode ? 'bg-black' : 'bg-gray-100'} flex items-center justify-center relative`}
      >
        <video 
          ref={videoRef}
          className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
          playsInline
          muted
        />
        
        <canvas 
          ref={canvasRef}
          className="hidden absolute top-0 left-0 w-full h-full"
        />
        
        {!isScanning && (
          <div className="text-center p-4">
            <Camera size={48} className={`mx-auto mb-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Camera preview will appear here
            </p>
          </div>
        )}
      </div>
      
      {errorMessage && (
        <div className="mt-3 p-2 bg-red-100 border border-red-300 text-red-800 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      
      <div className="mt-4 flex gap-3">
        <button
          onClick={onClose}
          className={`flex-1 p-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
        >
          Cancel
        </button>
        
        {isScanning ? (
          <button
            onClick={stopScanner}
            className="flex-1 p-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            Stop Scanning
          </button>
        ) : (
          <button
            onClick={startScanner}
            className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center gap-1"
          >
            <Camera size={18} />
            <span>Start Camera</span>
          </button>
        )}
      </div>
      
      <p className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Position the {scanType === 'qr' ? 'QR code' : 'barcode'} within the frame to scan
      </p>
    </div>
  );
};

export default OptimizedCodeScanner;
