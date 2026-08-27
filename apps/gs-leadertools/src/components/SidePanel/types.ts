import React from 'react';
import { ButtonProps } from '@/components/Button/types';

export interface SidePanelProps {
  title: string;
  isOpen: boolean;
  programLevel?: string;
  closeButtonAreaLabel?: string;
  onClose?: () => void;
  children?: React.ReactNode;
  printButton?: ButtonProps;
}
