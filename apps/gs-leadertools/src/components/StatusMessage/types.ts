import { LinkModel } from '@/types/link';

export interface StatusMessageProps {
  title: string;
  buttonLabel: string;
  buttonAriaLabel?: string;
  buttonLink?: LinkModel;
  onClick?: () => void;
}
