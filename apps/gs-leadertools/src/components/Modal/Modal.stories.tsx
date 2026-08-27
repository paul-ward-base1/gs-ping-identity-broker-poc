import { Meta, StoryObj } from '@storybook/react';

import { Modal as Component } from './Modal';
import { defaultModalProps } from './constants.storybook';
import { ModalProps } from './types';
import { Accordion } from '@/components/Accordion';
import { defaultAccordionArgs } from '@/components/Accordion/constants.storybook';
import React, { JSX } from 'react';
import { Button } from '@/components/Button';

export default {
  title: 'Components/Modal',
  component: Component,
  args: defaultModalProps,
} as Meta;

const ModalIntegrations = (args: JSX.IntrinsicAttributes & ModalProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleModal = React.useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <>
      {!isOpen && (
        <Button onClick={toggleModal} variant="primary" size="large" label="Toggle Modal" ariaLabel="Toggle Modal" />
      )}
      <Component {...args} onClose={toggleModal} isOpen={isOpen}>
        <Accordion {...defaultAccordionArgs} />
        <Accordion {...defaultAccordionArgs} />
        <Accordion {...defaultAccordionArgs} />
      </Component>
    </>
  );
};

export const Modal: StoryObj<ModalProps> = {
  render: args => <ModalIntegrations {...args} />,
};
