import { Meta, StoryObj } from '@storybook/react';

import { Accordion as Component } from './Accordion';
import { defaultAccordionArgs } from './constants.storybook';
import { AccordionProps } from './types';

export default {
  title: 'Components/Accordion',
  component: Component,
  args: defaultAccordionArgs,
} as Meta;

export const Accordion: StoryObj<AccordionProps> = {};

export const AccordionDefaultOpen: StoryObj<AccordionProps> = {
  args: {
    ...defaultAccordionArgs,
    defaultOpen: true,
  },
};
