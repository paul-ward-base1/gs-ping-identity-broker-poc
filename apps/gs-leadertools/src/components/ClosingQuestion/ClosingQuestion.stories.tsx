import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ClosingQuestion } from './ClosingQuestion';

const meta = {
  title: 'Components/ClosingQuestion',
  component: ClosingQuestion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ClosingQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => <ClosingQuestion {...args} />,
  args: {
    title: 'Closing Question',
    description:
      '<p>After completing the activities, Girl Scouts sh…-being of wild animals in their communities.</p>',
    questionText: 'Whats one thing you can do to help animals in the wild?',
  },
};
