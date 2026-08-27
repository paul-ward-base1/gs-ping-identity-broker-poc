import { AccordionItemProps } from '@/components/AccordionItem/types';
import { TagProps } from '@/components/Tag/types';
import { ProgramLevelEnum } from '../../types/programLevel';

const tagsFilled: TagProps[] = [
  {
    level: ProgramLevelEnum.DAISY,
    type: 'filled',
  },
  {
    level: ProgramLevelEnum.BROWNIE,
    type: 'filled',
  },
  {
    level: ProgramLevelEnum.JUNIOR,
    type: 'filled',
  },
  {
    level: ProgramLevelEnum.CADETTE,
    type: 'filled',
  },
  {
    level: ProgramLevelEnum.SENIOR,
    type: 'filled',
  },
  {
    level: ProgramLevelEnum.AMBASSADOR,
    type: 'filled',
  },
  {
    level: ProgramLevelEnum.ALL,
    type: 'filled',
  },
];

const tagsContent: TagProps[] = [
  {
    level: ProgramLevelEnum.DAISY,
    type: 'content',
  },
  {
    level: ProgramLevelEnum.BROWNIE,
    type: 'content',
  },
  {
    level: ProgramLevelEnum.JUNIOR,
    type: 'content',
  },
  {
    level: ProgramLevelEnum.CADETTE,
    type: 'content',
  },
  {
    level: ProgramLevelEnum.SENIOR,
    type: 'content',
  },
  {
    level: ProgramLevelEnum.AMBASSADOR,
    type: 'content',
  },
  {
    level: ProgramLevelEnum.ALL,
    type: 'content',
  },
];

const accordionItems: AccordionItemProps[] = [
  {
    title: 'Create a show',
    timeRange: '30 - 40 minutes',
    tags: tagsFilled,
  },
  {
    title: 'Explore wild animals near your home, meeting place, or school',
    timeRange: '30 - 40 minutes',
    tags: tagsContent,
    primaryButton: {
      label: 'See full details',
      onClick: () => alert('see full details'),
      variant: 'secondary',
      size: 'small',
      icon: 'arrow-right',
      ariaLabel: 'See full detail',
    },

    secondaryButton: {
      label: 'Preview',
      onClick: () => alert('Preview'),
      variant: 'tertiary',
      size: 'small',
      icon: 'eye',
      ariaLabel: 'preview',
    },
  },
];

export const defaultAccordionArgs = {
  title: 'Activity ideas',
  items: accordionItems,
  defaultOpen: false,
};
