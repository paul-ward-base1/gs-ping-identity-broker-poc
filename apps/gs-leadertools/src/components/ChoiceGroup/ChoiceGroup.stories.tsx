import React from 'react';

import { Meta, StoryObj } from '@storybook/react';

import { ChoiceGroup as Component } from './ChoiceGroup';
import { ChoiceGroupProps } from './types';
import { Choice } from '@/components/Choice';

export default {
  title: 'Components/ChoiceGroup',
  component: Component,
  args: {
    legend: '',
    disabled: false,
  },
  parameters: {
    controls: {
      exclude: ['children', 'type', 'onChange', 'className'],
    },
  },
} as Meta;

export const CheckboxGroup: StoryObj<ChoiceGroupProps> = {
  render: (args: ChoiceGroupProps) => (
    <Component {...args}>
      <Choice id="en" name="english" label="English" />
      <Choice id="fr" name="french" label="French" checked />
      <Choice id="spanish" name="spanish" label="Spanish" />
    </Component>
  ),
};

export const RadioGroup: StoryObj<ChoiceGroupProps> = {
  render: (args: ChoiceGroupProps) => (
    <Component {...args} type="radio">
      <Choice id="en" name="english" label="English" />
      <Choice id="fr" name="french" label="French" checked />
      <Choice id="es" name="spanish" label="Spanish" />
    </Component>
  ),
};
