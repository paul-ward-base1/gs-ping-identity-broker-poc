import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import { DetailPageHero } from './DetailPageHero';
import { ProgramLevelEnum } from '../../types/programLevel';

const imageMap = {
  [ProgramLevelEnum.JUNIOR]: '.storybook/public/animal-habitats.svg',
  [ProgramLevelEnum.DAISY]: '.storybook/public/animal-observer.svg',
  [ProgramLevelEnum.BROWNIE]: '.storybook/public/automative1.svg',
  [ProgramLevelEnum.CADETTE]: '.storybook/public/animal-helper.svg',
  [ProgramLevelEnum.SENIOR]: '.storybook/public/adventure-camper.svg',
  [ProgramLevelEnum.AMBASSADOR]: '.storybook/public/snow-climbing-adventure.svg',
};

export default {
  title: 'Components/DetailPageHero',
  component: DetailPageHero,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    programLevels: {
      control: false,
    },
    goBackLink: { control: false },
    imageAlt: { control: false },
    theme: { control: false },
    primaryButton: { control: false },
    secondaryButtonLabel: { control: false },
    image: { control: false },
  },
} as Meta<typeof DetailPageHero>;

const Template: StoryFn<typeof DetailPageHero> = args => {
  const level = args.programLevels[0];

  return (
    <DetailPageHero
      {...args}
      image={{ path: imageMap[level] }}
      imageAlt={'Example of Image Alt for Storybook'}
      theme={'Computer Science'}
      primaryButton={{ label: 'Buy badge', url: 'https://www.google.com' }}
      secondaryButtonLabel={'View badge preparation'}
      secondaryButtonAriaLabel={'View badge preparation'}
    />
  );
};

export const Junior = Template.bind({});
Junior.args = {
  title: 'Animal Habitats',
  description:
    'Animals like monkeys and kangaroos live in the wild, so we don’t get to spend time with them in their natural homes—their habitats. In this badge, you’ll find out about where animals live, how they play, and how we can help them!',
  programLevels: [ProgramLevelEnum.JUNIOR],
};

export const Daisy = Template.bind({});
Daisy.args = {
  title: 'Animal Observer',
  description:
    'Animals like monkeys and kangaroos live in the wild, so we don’t get to spend time with them in their natural homes—their habitats. In this badge, you’ll find out about where animals live, how they play, and how we can help them!',
  programLevels: [ProgramLevelEnum.DAISY],
};

export const Brownie = Template.bind({});
Brownie.args = {
  title: 'Pets',
  description:
    'Animals like monkeys and kangaroos live in the wild, so we don’t get to spend time with them in their natural homes—their habitats. In this badge, you’ll find out about where animals live, how they play, and how we can help them!',
  programLevels: [ProgramLevelEnum.BROWNIE],
};

export const Cadette = Template.bind({});
Cadette.args = {
  title: 'Animal Helper',
  description:
    'Animals like monkeys and kangaroos live in the wild, so we don’t get to spend time with them in their natural homes—their habitats. In this badge, you’ll find out about where animals live, how they play, and how we can help them!',
  programLevels: [ProgramLevelEnum.CADETTE],
};

export const Senior = Template.bind({});
Senior.args = {
  title: 'Voice for animals',
  description:
    'Animals like monkeys and kangaroos live in the wild, so we don’t get to spend time with them in their natural homes—their habitats. In this badge, you’ll find out about where animals live, how they play, and how we can help them!',
  programLevels: [ProgramLevelEnum.SENIOR],
};

export const Ambassador = Template.bind({});
Ambassador.args = {
  title: 'Eco advocate',
  description:
    'Animals like monkeys and kangaroos live in the wild, so we don’t get to spend time with them in their natural homes—their habitats. In this badge, you’ll find out about where animals live, how they play, and how we can help them!',
  programLevels: [ProgramLevelEnum.AMBASSADOR],
};
