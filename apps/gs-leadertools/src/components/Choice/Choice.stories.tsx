import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { Choice } from './Choice';
import { defaultChoiceProps } from './constants.storybook';
import { ChoiceProps } from './types';

export default {
  title: 'Components/Choice',
  component: Choice,
  args: defaultChoiceProps,
  parameters: {
    controls: {
      exclude: ['type', 'onChange', 'onBlur', 'className', 'dark'],
    },
  },
} as Meta;

export const Checkbox: StoryObj<ChoiceProps> = {
  render: (args: ChoiceProps) => <Choice {...args} />,
};

export const Radio: StoryObj<ChoiceProps> = {
  render: (args: ChoiceProps) => <Choice {...args} type="radio" />,
};
