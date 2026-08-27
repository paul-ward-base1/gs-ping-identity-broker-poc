import type { Meta, StoryObj } from '@storybook/react';
import { DownloadAllButton } from './DownloadAllButton';

const meta = {
  title: 'Components/DownloadAllButton',
  component: DownloadAllButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof DownloadAllButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const urls = ['/sample-a.pdf', '/sample-b.pdf'];

export const Inline: Story = { args: { variant: 'inline', urls } };
export const Footer: Story = { args: { variant: 'footer', urls } };
