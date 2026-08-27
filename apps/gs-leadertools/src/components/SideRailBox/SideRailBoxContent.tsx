import React from 'react';
import { cn } from '@/utils/classNames';
import { Supply } from '@/components/Supply';
import { RelatedBadge } from '@/components/RelatedBadge';
import { SideRailHandouts } from '@/components/SideRailBox/SideRailHandouts';
import { SideRailBoxItem, SideRailBoxType } from '@/components/SideRailBox/types';

const bem = cn('side-rail-box');

export const SideRailBoxContent = (item: SideRailBoxItem) => {
  switch (item.type) {
    case SideRailBoxType.TIME:
    case SideRailBoxType.SECTION:
      return (
        <div className={bem('section')}>
          <span className={bem('description')}>{item.value}</span>
        </div>
      );

    case SideRailBoxType.SUPPLY:
      return <Supply key={item.label} {...item} showBullet={false} />;
    case SideRailBoxType.HANDOUT_ITEMS:
      return (
        !!item.handouts.length && (
          <SideRailHandouts key={item.header} handouts={item.handouts} header={item.header} />
        )
      );
    case SideRailBoxType.RELATED_BADGES:
    default:
      return <RelatedBadge {...item} />;
  }
};
