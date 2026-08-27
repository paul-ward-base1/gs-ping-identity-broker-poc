import { Meta, StoryObj } from '@storybook/react';

import { Pagination as Component } from './Pagination';
import { defaultPaginationProps } from './constants.storybook';

export default {
  title: 'Components/Pagination',
  component: Component,
  args: defaultPaginationProps,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

export const Pagination: StoryObj = {};
