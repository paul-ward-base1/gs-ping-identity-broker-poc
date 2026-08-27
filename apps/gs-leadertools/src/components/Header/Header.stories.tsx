import type { Meta, StoryObj } from '@storybook/react';
import { Header } from './Header';
import { defaultHeaderArgs } from './constants.storybook';
import { HeaderProps } from '@/components/Header/types';
import { LocaleProvider } from '@/components/contexts/locale-context';

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  args: defaultHeaderArgs,
  argTypes: {
    navigationItems: {
      control: { type: 'object' },
      description: 'Array of navigation items',
      table: {
        type: {
          summary: 'Array<{ label: string; href: string }>',
        },
      },
    },
  },
};

export default meta;

export const HeaderDefault: StoryObj<HeaderProps> = {
  render: args => {
    return (
      <LocaleProvider locale="en">
        <Header />
      </LocaleProvider>
    );
  },
};
