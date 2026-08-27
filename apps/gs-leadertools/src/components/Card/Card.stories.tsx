import { Meta, StoryObj } from '@storybook/react';

import { activityBadgeCardProps, defaultBadgeCardProps } from './constants.storybook';
import { CardProps } from './types';
import { Card as Component } from './Card';

export default {
  title: 'Components/Card',
  component: Component,
} as Meta;

export const BadgeCard: StoryObj<CardProps> = {
  args: defaultBadgeCardProps,
};

export const ActivityCard: StoryObj<CardProps> = {
  args: activityBadgeCardProps,
};
