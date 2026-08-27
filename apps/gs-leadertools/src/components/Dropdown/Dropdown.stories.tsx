import { Meta, StoryObj } from '@storybook/react';

import { Dropdown as Component } from './Dropdown';
import { defaultDropdownProps } from './constants.storybook';
import { DropdownProps } from './types';

export default {
  title: 'Components/Dropdown',
  component: Component,
  args: defaultDropdownProps,
} as Meta;

export const Dropdown: StoryObj<DropdownProps> = {};
