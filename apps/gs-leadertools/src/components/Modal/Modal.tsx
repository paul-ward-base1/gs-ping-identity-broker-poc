import React from 'react';
import { cn } from '@/utils/classNames';
import { ModalProps } from './types';
import { Button } from '@/components/Button';
import './Modal.scss';
import { useOverlay } from '@/utils/useOverlay';

const bem = cn('modal');

export const Modal = (props: ModalProps) => {
  const { isOpen, title, children, fullDetailsButton, closeButton } = props;

  useOverlay(isOpen);
  return (
    <div className={bem({ open: isOpen })}>
      <div className={bem('container')}>
        <div className={bem('header')}>
          <span className={bem('title')}>{title}</span>
          <div className={bem('actions')}>
            {!!fullDetailsButton && (
              <span className={bem('details-desktop')}>
                <Button {...fullDetailsButton} />
              </span>
            )}
            {!!closeButton && <Button {...closeButton} />}
          </div>
        </div>
        <div className={bem('content')}>
          {children}
          {!!fullDetailsButton && (
            <span className={bem('details-mobile')}>
              <Button {...fullDetailsButton} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
