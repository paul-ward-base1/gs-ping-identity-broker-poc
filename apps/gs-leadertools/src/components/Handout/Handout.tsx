import { OutlinedCard } from '@/components/OutlinedCard';
import { cn } from '@/utils/classNames';
import { HandoutCardProps } from '@/components/Handouts/types';
import './Handout.scss';

const bem = cn('handout');

export const Handout = ({ title, ariaLabel, url, quantity, unit }: HandoutCardProps) => {
  return (
    <div className={bem()}>
      <OutlinedCard title={title} ariaLabel={ariaLabel} url={url} />
      <div className={bem('unit')}>
        {quantity} {unit}
      </div>
    </div>
  );
};
