// Type declarations for individually imported lucide icons
// This removes TypeScript warnings and allows for proper type checking

declare module 'lucide-react/dist/esm/icons/*' {
  import { LucideIcon } from 'lucide-react';
  const Icon: LucideIcon;
  export default Icon;
}

// For LucideProps type
declare module 'lucide-react' {
  import React from 'react';
  
  export interface LucideProps extends React.SVGAttributes<SVGElement> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
    color?: string;
    strokeWidth?: number | string;
  }
  
  export type LucideIcon = React.FC<LucideProps>;
}
