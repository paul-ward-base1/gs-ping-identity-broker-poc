'use client';

import React from 'react';
import { cn } from '@/utils/classNames';
import {
  PaintBrush,
  SealCheckIcon,
  ShieldIcon,
  UsersThree,
  FileTextIcon,
  FilesIcon,
  TrophyIcon,
} from '@/components/Icons';
import { ClockIcon } from '@/components/svgs';
import { SideRailBoxContent } from './SideRailBoxContent';
import { SideRailBoxItem, SideRailBoxProps, SideRailBoxType } from './types';
import './SideRailBox.scss';

const bem = cn('side-rail-box');

const getItemKey = (item: SideRailBoxItem, index: number): string | number => {
  switch (item.type) {
    case SideRailBoxType.SECTION:
    case SideRailBoxType.TIME:
      return item.value;
    case SideRailBoxType.SUPPLY:
      return item.label;
    case SideRailBoxType.HANDOUT_ITEMS:
      return item.header;
    default:
      return item.badgeName ?? index;
  }
};

const boxIconMap = {
  shield: ShieldIcon,
  usersThree: UsersThree,
  time: ClockIcon,
  sealCheck: SealCheckIcon,
  paintBrush: PaintBrush,
  fileText: FileTextIcon,
  files: FilesIcon,
  trophy: TrophyIcon,
};

export const SideRailBox = (props: SideRailBoxProps) => {
  const { title, icon, count, items, level } = props;

  const IconComponent = icon ? boxIconMap[icon] : null;

  return (
    <div className={bem()}>
      <div className={bem('header', { level })}>
        <span className={bem('top-data')}>
          {!!IconComponent && <IconComponent className={bem('icon')} />}
          <span className={bem('title')}> {title}</span>
        </span>
        {!!count && <span className={bem('count', { level })}>{count}</span>}
      </div>
      <div className={bem('content')}>
        {!!items?.length &&
          items.map((item, index) => {
            const key = getItemKey(item, index);
            return (
              <React.Fragment key={`${key}-${index}`}>
                <SideRailBoxContent {...item} />
                {index < items.length - 1 && <div className={bem('separator')} />}
              </React.Fragment>
            );
          })}
      </div>
    </div>
  );
};
