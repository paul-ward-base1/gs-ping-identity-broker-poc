import { CardProps } from '@/components/Card/types';

export interface CardListProps {
  items: CardProps[];
  loading?: boolean;
  placeholderCount?: number;
}
