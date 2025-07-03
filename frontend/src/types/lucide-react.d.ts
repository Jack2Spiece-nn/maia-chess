declare module 'lucide-react' {
  import * as React from 'react';

  /** Basic props every Lucide icon component accepts */
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    color?: string;
    size?: string | number;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
  }

  /* Icon components used in this project */
  export const AlertCircle: React.FC<LucideProps>;
  export const Brain: React.FC<LucideProps>;
  export const Target: React.FC<LucideProps>;
  export const Info: React.FC<LucideProps>;
  export const Square: React.FC<LucideProps>;
  export const Play: React.FC<LucideProps>;
  export const Flag: React.FC<LucideProps>;
  export const Palette: React.FC<LucideProps>;
  export const Zap: React.FC<LucideProps>;
  export const Trophy: React.FC<LucideProps>;
  export const Clock: React.FC<LucideProps>;
  export const Crown: React.FC<LucideProps>;
  export const User: React.FC<LucideProps>;

  // fallback export for any other icon the codebase may import
  const Icon: React.FC<LucideProps>;
  export default Icon;
}