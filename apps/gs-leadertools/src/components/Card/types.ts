import { TagProps } from '@/components/Tag/types';

export interface CardProps {
  id: string;
  title: string;
  theme: string;
  cardImage: string;
  time?: string;
  programLevels?: TagProps[];
  hasAllLevels?: boolean;
  link?: string;
  type?: 'activity' | 'badge';
}
