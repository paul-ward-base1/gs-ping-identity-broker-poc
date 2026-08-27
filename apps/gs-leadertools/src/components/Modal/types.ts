import React from 'react';
import { ButtonProps } from '@/components/Button/types';

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  fullDetailsButton?: ButtonProps;
  closeButton?: ButtonProps;
  children?: React.ReactNode;
}
