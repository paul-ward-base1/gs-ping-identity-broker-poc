import { cn } from '@/utils/classNames';
import { OutlinedCard } from '@/components/OutlinedCard';
import { DownloadAllButton } from '@/components/DownloadAllButton';
import { getDownloadableUrls } from '@/utils/getDownloadableUrls';
import './Handouts.scss';
import { HandoutsProps } from './types';

const bem = cn('handouts');

export const Handouts = ({ title, cards }: HandoutsProps) => {
  const downloadableUrls = getDownloadableUrls(cards ?? []);

  return (
    <div className={bem()}>
      <div className={bem('header')}>
        <h2 className={bem('title')}>{title}</h2>
        {downloadableUrls.length > 1 && <DownloadAllButton variant="inline" urls={downloadableUrls} />}
      </div>
      <div className={bem('items')}>
        {cards?.map((card, index) => (
          <OutlinedCard key={`${card.title}-${index}`} title={card.title} ariaLabel={card.ariaLabel} url={card.url} />
        ))}
      </div>
    </div>
  );
};
