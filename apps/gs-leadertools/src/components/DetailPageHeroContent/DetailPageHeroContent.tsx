import React from 'react';
import Image from 'next/image';
import { cn } from '@/utils/classNames';
import { buildImagePath } from '@/utils/buildImagePath';
import { Button } from '@/components/Button';
import { Tag } from '@/components/Tag';
import { RichText } from '@/components/RichText';
import { ProgramLevelIds } from '@/types/programLevel';
import { DetailPageHeroContentProps } from './types';
import './DetailPageHeroContent.scss';
import { useIsAuthorMode } from '@/components/contexts/locale-context';

const bem = cn('detail-page-hero-content');

export const DetailPageHeroContent = ({
  image,
  imageAlt,
  programLevels,
  theme,
  title,
  description,
  descriptionHtml,
  primaryButton,
  secondaryButtonLabel,
  secondaryButtonClick,
  secondaryButtonAriaLabel,
  ueTitleProp = 'badgeName',
}: DetailPageHeroContentProps) => {
  const isAuthorMode = useIsAuthorMode();
  const isMultipleTags = programLevels.length > 1 || programLevels[0].id === ProgramLevelIds.ALL;

  const buyBadgeLink = {
    url: primaryButton?.url ?? '',
    target: '_blank' as const,
  };

  const imageSrc = buildImagePath(image?.path);

  return (
    <div className={bem()}>
      <div className={bem('image')}>
        {!!imageSrc && (
          <Image
            src={imageSrc}
            alt={imageAlt ?? ''}
            width={400}
            height={400}
            sizes="(min-width: 768px) 400px, 280px"
            priority
            aria-hidden="true"
            unoptimized={isAuthorMode}
          />
        )}
      </div>
      <div className={bem('info')}>
        <div className={bem('tags-and-text')}>
          <div className={bem('tags', { multiple: isMultipleTags })}>
            {!!programLevels?.length &&
              programLevels?.map((el, index) => (
                <Tag key={`${index}-${el.id}`} id={el.id} level={el.level} type="filled" />
              ))}
            {!!theme && (
              <div className={bem('pillar-text-wrapper')}>
                {!!programLevels?.length && <span className={bem('divider')} />}
                <span className={bem('pillar-text')}>{theme}</span>
              </div>
            )}
          </div>
          <div className={bem('text')}>
            <h1
              className={bem('title')}
              {...(isAuthorMode && {
                'data-aue-prop': ueTitleProp,
                'data-aue-type': 'text',
                'data-aue-label': 'Title',
              })}
            >
              {title}
            </h1>
            {descriptionHtml ? (
              <RichText
                className={bem('description')}
                value={descriptionHtml}
                {...(isAuthorMode && {
                  'data-aue-prop': 'description',
                  'data-aue-type': 'richtext',
                  'data-aue-label': 'Description',
                })}
              />
            ) : (
              <span
                className={bem('description', { plaintext: true })}
                {...(isAuthorMode && {
                  'data-aue-prop': 'description',
                  'data-aue-type': 'text',
                  'data-aue-label': 'Description',
                })}
              >
                {description}
              </span>
            )}
          </div>
        </div>
        <div className={bem('buttons')}>
          {primaryButton && (
            <div
              className={bem('buy-badge-button')}
              {...(isAuthorMode && {
                'data-aue-prop': 'purchaseLink',
                'data-aue-type': 'reference',
                'data-aue-label': 'Buy Badge Button',
                ...(primaryButton.path && {
                  'data-aue-resource': `urn:aemconnection:${primaryButton.path}/jcr:content/data/master`,
                }),
              })}
            >
              <Button
                variant="primary"
                size="small"
                ctaType="purchase"
                label={primaryButton?.label}
                link={buyBadgeLink}
                fill
              />
            </div>
          )}
          {!!secondaryButtonLabel && (
            <div className={bem('view-badge-button')}>
              <Button
                variant="secondary"
                size="small"
                ariaLabel={secondaryButtonAriaLabel ?? secondaryButtonLabel}
                label={secondaryButtonLabel}
                onClick={secondaryButtonClick}
                fill
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
