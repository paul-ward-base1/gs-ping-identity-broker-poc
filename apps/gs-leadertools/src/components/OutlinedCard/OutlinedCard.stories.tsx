import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { OutlinedCard } from './OutlinedCard';

const SAMPLE_PDF_URL = '/sample-handout.pdf';

const meta = {
  title: 'Components/OutlinedCard',
  component: OutlinedCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OutlinedCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <OutlinedCard {...args} />,
  args: {
    title: 'Outdoor Progression Chart',
    ariaLabel: 'Download Outdoor Progression Chart',
  },
};

export const WithURL: Story = {
  render: args => <OutlinedCard {...args} />,
  args: {
    title: 'Starter List for Your First Aid Kit',
    ariaLabel: 'Download Starter List for Your First Aid Kit',
    url: SAMPLE_PDF_URL,
  },
};

export const LongTitle: Story = {
  render: args => <OutlinedCard {...args} />,
  args: {
    title: 'Starter List for Your First Aid Kit — Junior Badge Activity Guide',
    ariaLabel: 'Download Starter List for Your First Aid Kit — Junior Badge Activity Guide',
    url: SAMPLE_PDF_URL,
  },
};
