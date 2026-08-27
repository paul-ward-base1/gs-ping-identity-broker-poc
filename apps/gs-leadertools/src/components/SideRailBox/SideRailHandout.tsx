import { cn } from '@/utils/classNames';
import { HandoutCardProps } from '@/components/Handouts/types';
import { OutlinedCard } from '@/components/OutlinedCard';

const bem = cn('side-rail-box-handout');

export const SideRailHandout = ({ title, ariaLabel, url, quantity, unit }: HandoutCardProps) => {
  return (
    <div className={bem()}>
      <OutlinedCard title={title} ariaLabel={ariaLabel} url={url} />
      <div className={bem('unit')}>
        {quantity} {unit}
      </div>
    </div>
  );
};
