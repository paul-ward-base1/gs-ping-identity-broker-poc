import { cn } from '@/utils/classNames';
import { MaterialModel } from '@/types/material';
import './Supply.scss';

const bem = cn('supply');

export const Supply = ({ label, optional, quantity, unit, showBullet = true }: MaterialModel) => {
  return (
    <div className={bem()}>
      <div className={bem('data')}>
        {showBullet && <span className={bem('data-bullet')}></span>}
        <span className={bem('data-label')}>
          {label}
          {optional && <span className={bem('data-optional')}>(optional)</span>}
        </span>
      </div>
      <div className={bem('unit')}>
        {quantity} {unit}
      </div>
    </div>
  );
};
