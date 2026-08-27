import { ReactNode } from 'react';
import { AccordionItemProps } from '@/components/AccordionItem/types';
import { ParsedAccordionItem } from '@/components/ActivityPageClient/types';

export interface AccordionProps {
  title: string;
  level?: string;
  items?: AccordionItemProps[] | ParsedAccordionItem[];
  defaultOpen?: boolean;
  printAction?: boolean;
  useChildrenContent?: boolean;
  count?: number;
  children?: ReactNode;
  variant?: 'richText' | 'default';
}
