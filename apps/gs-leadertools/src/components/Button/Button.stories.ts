import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary'],
    },
    size: {
      control: 'select',
      options: ['small', 'large'],
    },
    label: {
      control: 'text',
    },
    icon: {
      control: 'select',
      options: [
        undefined,
        'arrow-right',
        'eye',
        'caret-left',
        'caret-right',
        'caret-up',
        'caret-down',
        'arrow-square-out',
        'clipboard-text',
      ],
    },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
    link: { control: 'object' },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const ButtonDefault: Story = {
  args: {
    label: 'View Activity',
    variant: 'primary',
    size: 'large',
    icon: 'arrow-right',
    disabled: false,
  },
};

export const IconOnly: Story = {
  args: {
    variant: 'icon-only',
    icon: 'arrow-right',
    disabled: false,
  },
  argTypes: {
    variant: { control: false },
    size: { control: false },
    label: { control: false },
  },
};

export const AsInternalLink: Story = {
  args: {
    label: 'Go to Home',
    variant: 'primary',
    disabled: false,
    size: 'large',
    link: {
      _path: '/',
      type: 'internal',
    },
  },
};

export const AsExternalLink: Story = {
  args: {
    label: 'Go to Google',
    variant: 'primary',
    size: 'large',
    link: {
      url: 'https://www.google.com',
      target: '_blank',
    },

  },
};
