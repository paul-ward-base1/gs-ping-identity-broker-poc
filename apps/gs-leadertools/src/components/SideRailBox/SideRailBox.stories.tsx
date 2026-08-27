import type { Meta, StoryObj } from '@storybook/react';
import { SideRailBox } from './SideRailBox';
import { defaultSideRailBoxProps } from './constants.storybook';
import { SideRailBoxProps } from './types';

const meta: Meta<typeof SideRailBox> = {
  title: 'Components/SideRailBox',
  component: SideRailBox,
  tags: ['autodocs'],
  args: defaultSideRailBoxProps,
};

export default meta;

type Story = StoryObj<typeof SideRailBox>;

const SideRailBoxIntegration = (args: SideRailBoxProps) => {
  return <SideRailBox {...args} />;
};

export const SideRailBoxDefault: Story = {
  render: args => <SideRailBoxIntegration {...args} />,
};
