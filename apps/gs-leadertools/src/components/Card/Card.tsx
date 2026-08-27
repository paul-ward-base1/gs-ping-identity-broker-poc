import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/classNames';
import { ClockIcon } from '@/components/svgs';
import { Tooltip } from '@/components/Tooltip/Tooltip';
import { buildImagePath } from '@/utils/buildImagePath';
import { CardProps } from './types';
import './Card.scss';
import { Tag } from '@/components/Tag';

const bem = cn('card');

export const Card = (props: CardProps) => {
  const { title, theme, programLevels, time, link, cardImage, type, hasAllLevels } = props;

  const mobileProgramLevels = useMemo(
    () =>
      programLevels
        ?.slice(1)
        .map(el => el.level)
        .join(', '),
    [programLevels]
  );
  const desktopProgramLevels = useMemo(
    () =>
      programLevels
        ?.slice(2)
        .map(el => el.level)
        .join(', '),
    [programLevels]
  );

  return (
    <Link href={link ?? '#'} className={bem()}>
      <div className={bem('image-wrapper', { type })}>
        {cardImage && (
          <Image
            src={buildImagePath(cardImage)}
            alt={title ?? ''}
            className={bem('image')}
            aria-hidden="true"
            fill
            sizes="(max-width: 768px) 50vw, 282px"
          />
        )}
      </div>

      <div className={bem('content')}>
        <div className={bem('info')}>
          <div className={bem('title')}>{title}</div>
          <div className={bem('description')} aria-hidden="true">
            <div className={bem('theme')}>{theme}</div>
            {time && (
              <div className={bem('timeRange')}>
                <ClockIcon className={bem('time')} />
                {time}
              </div>
            )}
          </div>
        </div>

        {!!programLevels?.length && (
          <>
            <div className={bem('program-levels', { desktop: true })}>
              {hasAllLevels ? (
                <Tag id={programLevels[0].id} level={programLevels[0].level} type="content" />
              ) : (
                programLevels
                  ?.slice(0, 2)
                  .map((level, index) => (
                    <Tag key={`${level.id}-${index}`} id={level.id} level={level.level} type="content" />
                  ))
              )}

              {programLevels.length > 2 && !hasAllLevels && (
                <Tooltip text={desktopProgramLevels ?? ''}>
                  <span className={bem('counter')}>+{programLevels?.slice(2).length}</span>
                </Tooltip>
              )}
            </div>
            <div className={bem('program-levels', { mobile: true })}>
              {hasAllLevels ? (
                <Tag id={programLevels[0].id} level={programLevels[0].level} type="content" />
              ) : (
                programLevels
                  ?.slice(0, 1)
                  .map((level, index) => (
                    <Tag key={`${level.id}-${index}`} id={level.id} level={level.level} type="content" />
                  ))
              )}

              {programLevels.length > 1 && !hasAllLevels && (
                <Tooltip text={mobileProgramLevels ?? ''}>
                  <span className={bem('counter')}>+{programLevels?.slice(1).length}</span>
                </Tooltip>
              )}
            </div>
          </>
        )}
      </div>
    </Link>
  );
};
