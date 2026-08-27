import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DownloadButton } from './DownloadButton';

const SAMPLE_PDF_URL = '/sample-handout.pdf';

const meta = {
  title: 'Components/DownloadButton',
  component: DownloadButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DownloadButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <DownloadButton {...args} />,
  args: {
    url: SAMPLE_PDF_URL,
    ariaLabel: 'Download Starter List for Your First Aid Kit',
  },
};

