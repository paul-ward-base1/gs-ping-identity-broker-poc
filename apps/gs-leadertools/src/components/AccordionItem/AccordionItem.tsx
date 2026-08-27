import { cn } from '@/utils/classNames';

import { Tag } from '@/components/Tag';
import { Button } from '@/components/Button';
import { ClockIcon } from '@/components/svgs';
import { ProgramLevelEnum, ProgramLevelIds } from '@/types/programLevel';
import { UsersThree } from '@/components/Icons';

import './AccordionItem.scss';
import { AccordionItemProps } from './types';

const bem = cn('accordion-item');

export const AccordionItem = ({
  title,
  timeRange,
  tags,
  primaryButton,
  secondaryButton,
  showBullet = true,
  hasAllLevels,
}: AccordionItemProps) => {
  return (
    <div className={bem()}>
      <div className={bem('content')}>
        <div className={bem('data')}>
          {/* Bullet + title share a row so the dot centers vertically with
              the title text (rather than the whole stacked data block). */}
          <div className={bem('title-row')}>
            {showBullet && <span className={bem('bullet')} aria-hidden="true" />}
            <div className={bem('title')}>{title}</div>
          </div>
          <div className={bem('description')}>
            {!!timeRange && (
              <span className={bem('timing')}>
                <ClockIcon className={bem('clock')} />
                {timeRange}
              </span>
            )}
            {!!tags?.length && (
              <>
                {!!timeRange && <span className={bem('divider')} />}
                <div className={bem('tags')}>
                  <span className={bem('mobile-icon')}>
                    <UsersThree />
                  </span>
                  {hasAllLevels ? (
                    <Tag id={ProgramLevelIds.ALL} level={ProgramLevelEnum.ALL} type={'content'} />
                  ) : (
                    tags?.map(tag => <Tag key={tag.level} {...tag} />)
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {(!!primaryButton || !!secondaryButton) && (
        <div className={bem('actions')}>
          {primaryButton && <Button {...primaryButton} />}
          {secondaryButton && <Button {...secondaryButton} />}
        </div>
      )}
    </div>
  );
};
