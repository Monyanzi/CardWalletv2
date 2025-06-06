import React from 'react';
import { PS5_BLUE } from '../utils/constants';

interface PlaceholderLogoProps {
  company: string;
  color?: string;
  width?: number;
  height?: number;
  themeColor?: string;
}

export const PlaceholderLogo: React.FC<PlaceholderLogoProps> = ({ 
  company, 
  color = '#ccc', 
  width = 80, 
  height = 40, 
  themeColor = PS5_BLUE 
}) => {
  const initials = company
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width={width} height={height} rx="6" fill="rgba(255, 255, 255, 0.1)" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={themeColor} fontSize={height * 0.4} fontWeight="bold">
        {initials || '?'}
      </text>
      <rect width={width} height={height} rx="6" stroke={themeColor} strokeOpacity="0.3" />
    </svg>
  );
};

interface PlaceholderAvatarProps {
  name: string;
  size?: number;
  themeColor?: string;
}

export const PlaceholderAvatar: React.FC<PlaceholderAvatarProps> = ({ 
  name, 
  size = 64, 
  themeColor = PS5_BLUE 
}) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill="rgba(255, 255, 255, 0.1)" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={themeColor} fontSize={size * 0.5} fontWeight="bold">
        {initial}
      </text>
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} stroke={themeColor} strokeOpacity="0.3" />
    </svg>
  );
};

interface PlaceholderBarcodeProps {
  width?: number;
  height?: number;
  color?: string;
}

export const PlaceholderBarcode: React.FC<PlaceholderBarcodeProps> = ({ 
  width = 80, 
  height = 40, 
  color = 'white' 
}) => (
  <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width={width} height={height} fill="rgba(0,0,0,0.5)" rx="3"/>
    <g>
      {Array.from({ length: Math.floor(width / 3) }).map((_, i) => {
        const barWidth = 1 + Math.random() * 1.5;
        const xPos = i * 3 + 2;
        if (xPos + barWidth < width - 2) {
          return (
            <rect
              key={`bar-${i}`} x={xPos} y={height * 0.1}
              width={barWidth} height={height * 0.8} fill={color}
            />
          );
        }
        return null;
      })}
    </g>
  </svg>
);

interface PlaceholderQRCodeProps {
  size?: number;
  color?: string;
}

export const PlaceholderQRCode: React.FC<PlaceholderQRCodeProps> = ({ 
  size = 60, 
  color = 'white' 
}) => (
  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width={size} height={size} fill="rgba(0,0,0,0.5)" rx="3" />
    {/* Finder Patterns */}
    <rect x={size * 0.1} y={size * 0.1} width={size * 0.2} height={size * 0.2} fill={color} />
    <rect x={size * 0.7} y={size * 0.1} width={size * 0.2} height={size * 0.2} fill={color} />
    <rect x={size * 0.1} y={size * 0.7} width={size * 0.2} height={size * 0.2} fill={color} />
    {/* Data Modules */}
    <g>
      {Array.from({ length: 8 }).map((_, r) =>
        Array.from({ length: 8 }).map((_, c) => {
          if (Math.random() > 0.5) {
            return (
              <rect
                key={`qr-${r}-${c}`}
                x={size * 0.35 + c * (size * 0.05)} y={size * 0.35 + r * (size * 0.05)}
                width={size * 0.045} height={size * 0.045} fill={color}
              />
            );
          }
          return null;
        })
      )}
    </g>
  </svg>
);