import { Meta, StoryObj } from '@storybook/react';

import { Filter as Component } from './Filter';
import { defaultFilterProps } from './constants.storybook';
import { FilterProps } from './types';

export default {
  title: 'Components/Filter',
  component: Component,
  args: defaultFilterProps,
  parameters: {
    layout: 'centered',
  },
} as Meta;

export const Filter: StoryObj<FilterProps> = {};
