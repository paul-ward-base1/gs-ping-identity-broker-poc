import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '@/components/Button';
import { SideRailBox } from '@/components/SideRailBox/SideRailBox';
import { defaultSideRailBoxProps } from '@/components/SideRailBox/constants.storybook';
import { SidePanel as Component } from './SidePanel';
import { defaultSidePanelProps } from './constants.storybook';
import { SidePanelProps } from './types';

const meta: Meta<typeof Component> = {
  title: 'Components/SidePanel',
  component: Component,
  tags: ['autodocs'],
  args: defaultSidePanelProps,
};

export default meta;

type Story = StoryObj<typeof Component>;

const SidePanelIntegration = (args: SidePanelProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const togglePanel = React.useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return (
    <>
      {<Button onClick={togglePanel} variant="primary" size="large" label="Toggle Panel" />}
      <Component {...args} isOpen={isOpen} onClose={togglePanel}>
        <SideRailBox {...defaultSideRailBoxProps} />
      </Component>
    </>
  );
};

export const SidePanel: Story = {
  render: args => {
    return <SidePanelIntegration {...args} />;
  },
};
