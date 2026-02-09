declare module 'lucide-react' {
  import { FC, SVGProps } from 'react';
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  }
  export type Icon = FC<IconProps>;
  export const MessageCircle: Icon;
  export const Loader2: Icon;
  export const AlertCircle: Icon;
  export const Heart: Icon;
  export const Share2: Icon;
  export const Music4: Icon;
  export const Play: Icon;
  export const Pause: Icon;
  export const PartyPopper: Icon;
  export const ServerCrash: Icon;
  // Add others as needed or use a catch-all
  // export const [key: string]: Icon;
}
