'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/classNames';
import { StatusMessageProps } from '@/components/StatusMessage/types';
import { Button } from '@/components/Button';
import './StatusMessage.scss';

const bem = cn('status-message');

export const StatusMessage = ({ title, buttonLabel, buttonLink, onClick }: StatusMessageProps) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className={bem()}>
      <div className={bem('logo')}>
        <Image
          src="/gs_logomark.svg"
          alt="GS Logo"
          width={120}
          height={120}
          sizes="(max-width: 768px) 80px, 120px"
          priority
          unoptimized
        />
      </div>
      <h2 className={bem('title')}>{title}</h2>
      <Button
        variant="primary"
        size="large"
        ariaLabel={buttonLabel}
        label={buttonLabel}
        link={buttonLink}
        onClick={onClick}
      />
    </div>
  );
};
