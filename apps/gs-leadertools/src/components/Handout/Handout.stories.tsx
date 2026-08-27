import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Handout } from './Handout';

const SAMPLE_PDF_URL = '/sample-handout.pdf';

const meta = {
  title: 'Components/Handout',
  component: Handout,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Handout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <Handout {...args} />,
  args: {
    id: '1',
    title: 'Starter List for Your First Aid Kit',
    ariaLabel: 'Download Starter List for Your First Aid Kit',
    url: SAMPLE_PDF_URL,
    quantity: 2,
    unit: 'Per girl',
  },
};

export const WithoutQuantity: Story = {
  render: args => <Handout {...args} />,
  args: {
    id: '2',
    title: 'Starter List for Your First Aid Kit',
    ariaLabel: 'Download Starter List for Your First Aid Kit',
    url: SAMPLE_PDF_URL,
  },
};
