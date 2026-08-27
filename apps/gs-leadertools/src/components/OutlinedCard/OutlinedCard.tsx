'use client';

import { cn } from '@/utils/classNames';
import { DownloadButton } from '@/components/DownloadButton';
import { clickTracker } from '@/utils/gtmTracker';
import { getFileNameFromUrl } from '@/utils/getFileNameFromUrl';
import './OutlinedCard.scss';
import { OutlinedCardProps } from './types';
import { FileTextIcon } from '@/components/Icons';

const bem = cn('outlined-card');

export function OutlinedCard({ title, ariaLabel, url, variant = 'outlined' }: Readonly<OutlinedCardProps>) {
  const handleCardClick = () => {
    if (url) {
      clickTracker('pdf', url, getFileNameFromUrl(url));
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={bem({ variant })}
      onClick={handleCardClick}
      onKeyDown={e => {
        if (e.key === 'Enter') handleCardClick();
      }}
      role="link"
      tabIndex={0}
    >
      <div className={bem('card-content')}>
        <div className={bem('card-icon')}>
          <FileTextIcon />
        </div>
        <div className={bem('card-title')}>{title}</div>
      </div>
      <div className={bem('card-button')} onClick={e => e.stopPropagation()}>
        <DownloadButton url={url} ariaLabel={ariaLabel} />
      </div>
    </div>
  );
}
