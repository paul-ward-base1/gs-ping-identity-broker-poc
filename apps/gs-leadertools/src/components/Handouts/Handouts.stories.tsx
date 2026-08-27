import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Handouts } from './Handouts';

const SAMPLE_PDF_URL = '/sample-handout.pdf';

const meta = {
  title: 'Components/Handouts',
  component: Handouts,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Handouts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <Handouts {...args} />,
  args: {
    title: 'Handouts',
    cards: [
      {
        id: '1',
        title: 'Outdoor Progression Chart',
        ariaLabel: 'Download Outdoor Progression Chart',
        url: SAMPLE_PDF_URL,
      },
      {
        id: '2',
        title: 'Animal Habits Activity',
        ariaLabel: 'Download Animal Habits Activity',
        url: SAMPLE_PDF_URL,
      },
    ],
  },
};

export const SingleHandout: Story = {
  render: args => <Handouts {...args} />,
  args: {
    title: 'Handouts',
    cards: [
      {
        id: '1',
        title: 'Outdoor Progression Chart',
        ariaLabel: 'Download Outdoor Progression Chart',
        url: SAMPLE_PDF_URL,
      },
    ],
  },
};

export const WithOverflow: Story = {
  render: args => <Handouts {...args} />,
  args: {
    title: 'Handouts',
    cards: [
      {
        id: '1',
        title: 'Outdoor Progression Chart',
        ariaLabel: 'Download Outdoor Progression Chart',
        url: SAMPLE_PDF_URL,
      },
      {
        id: '2',
        title: 'Animal Habits Activity',
        ariaLabel: 'Download Animal Habits Activity',
        url: SAMPLE_PDF_URL,
      },
      {
        id: '3',
        title: 'Starter List for Your First Aid Kit',
        ariaLabel: 'Download Starter List for Your First Aid Kit',
        url: SAMPLE_PDF_URL,
      },
      {
        id: '4',
        title: 'Junior Badge Activity Guide',
        ariaLabel: 'Download Junior Badge Activity Guide',
        url: SAMPLE_PDF_URL,
      },
    ],
  },
};
