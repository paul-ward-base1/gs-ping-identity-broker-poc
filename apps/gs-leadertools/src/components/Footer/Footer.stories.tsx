import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from './Footer';
import { defaultFooterArgs } from './constants.storybook';

const meta: Meta<typeof Footer> = {
  title: 'Components/Footer',
  component: Footer,
  tags: ['autodocs'],
  args: defaultFooterArgs,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const FooterDefault: Story = {};
