import type { Meta, StoryObj } from '@storybook/react';
import { FilterChips } from './FilterChips';

const meta: Meta<typeof FilterChips> = {
  title: 'Components/FilterChips',
  component: FilterChips,
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'The label of the filter chips',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FilterChips>;

export const Default: Story = {
  args: {
    label: 'Label',
  },
};
