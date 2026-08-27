'use client';

import { cn } from '@/utils/classNames';
import { PageBannerProps } from '@/components/PageBanner/types';
import './PageBanner.scss';
import { useEffect } from 'react';

const bem = cn('page-banner');

export const PageBanner = ({ title }: PageBannerProps) => {
  useEffect(() => {
    document.title = title;
  }, []);

  return (
    <div className={bem()}>
      <h1 className={bem('title')}>{title}</h1>
    </div>
  );
};
