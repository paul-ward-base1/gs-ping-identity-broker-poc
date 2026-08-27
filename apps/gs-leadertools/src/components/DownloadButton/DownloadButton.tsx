import { type MouseEvent } from 'react';
import { cn } from '@/utils/classNames';
import { DownloadSimpleIcon } from '@/components/Icons';
import { DownloadButtonProps } from './types';
import { clickTracker } from '@/utils/gtmTracker';
import { getFileNameFromUrl } from '@/utils/getFileNameFromUrl';
import { resolveDownloadUrl } from '@/utils/resolveDownloadUrl';
import './DownloadButton.scss';

const bem = cn('download-button');

export function DownloadButton({ url, ariaLabel }: Readonly<DownloadButtonProps>) {
  const downloadUrl = resolveDownloadUrl(url);

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (url) clickTracker('pdf', url, getFileNameFromUrl(url));
  };

  return (
    <a className={bem()} href={downloadUrl} aria-label={ariaLabel} download onClick={handleClick}>
      <DownloadSimpleIcon className={bem('icon')} />
    </a>
  );
}
