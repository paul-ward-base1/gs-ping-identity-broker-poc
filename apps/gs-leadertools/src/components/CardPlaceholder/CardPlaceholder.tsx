import { cn } from '@/utils/classNames';
import './CardPlaceholder.scss';

const bem = cn('card-placeholder');

export const CardPlaceholder = () => {
  return (
    <div className={bem()}>
      <div className={bem('image')} />
      <div className={bem('content')}>
        <div className={bem('info')}>
          <div className={bem('title')}>
            <div className={bem('title-first')} />
            <div className={bem('title-second')} />
          </div>
          <div className={bem('description')} />
        </div>
        <div className={bem('program-levels')}>
          <div className={bem('icon')} />
          <div className={bem('level')} />
        </div>
      </div>
    </div>
  );
};
