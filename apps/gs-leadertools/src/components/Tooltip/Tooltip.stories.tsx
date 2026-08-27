import { Meta, StoryObj } from '@storybook/react';

import { Tooltip as Component } from './Tooltip';

export default {
  title: 'Components/Tooltip',
  component: Component,
  parameters: {
    layout: 'centered',
  },
} as Meta;

export const Tooltip: StoryObj = {
  render: () => {
    return (
      <Component text="CADETTE, AMBASSADOR">
        <span>+2</span>
      </Component>
    );
  },
};
