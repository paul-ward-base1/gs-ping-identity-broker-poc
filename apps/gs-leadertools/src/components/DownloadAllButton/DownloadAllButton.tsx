'use client';

import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/classNames';
import { DownloadSimpleIcon } from '@/components/Icons';
import { downloadFiles } from '@/utils/downloadFiles';
import { DownloadAllButtonProps } from './types';
import './DownloadAllButton.scss';

const bem = cn('download-all-button');

export function DownloadAllButton({ urls, variant }: Readonly<DownloadAllButtonProps>) {
  const { t } = useTranslation();

  const label =
    variant === 'footer'
      ? t('global.button.downloadAllHandouts.label', { defaultValue: 'Download all handouts' })
      : t('global.button.downloadAll.label', { defaultValue: 'Download all' });

  const ariaLabel = t('global.button.downloadAll.hint', { defaultValue: 'Download all handouts' });

  return (
    <button
      type="button"
      className={bem({ [variant]: true })}
      aria-label={ariaLabel}
      onClick={() => downloadFiles(urls)}
    >
      <DownloadSimpleIcon className={bem('icon')} />
      <span className={bem('label')}>{label}</span>
    </button>
  );
}
