import React from 'react';
import { useLayoutChildren } from '@/utils/useChildren';
import { cn } from '@/utils/classNames';
import './DetailPageLayout.scss';

const bem = cn('detail-page-layout');

export const DetailPageLayout = ({ children }: { children: React.ReactElement[] }) => {
  const { content, sidebar } = useLayoutChildren(children);

  return (
    <div className={bem('container')}>
      <div className={bem('content')}>{content}</div>
      <div className={bem('side-wrapper')}>
        <div className={bem('side-rail')}>{sidebar}</div>
      </div>
    </div>
  );
};
