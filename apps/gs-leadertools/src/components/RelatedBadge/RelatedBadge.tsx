import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utils/classNames';
import { Tag } from '@/components/Tag';
import { CaretRightIcon } from '@/components/Icons';
import { tagIconMapping } from '@/components/Tag/constants';
import { normalizeBadgePath } from '@/lib/aemContext';
import { RelatedBadgeProps } from './types';
import './RelatedBadge.scss';

const bem = cn('related-badge');

// Block protocol-relative (`//evil`) and absolute URLs so `hrefOverride`
// can't turn a side-rail row into an open redirect.
const isInternalHref = (href: string): boolean => href.startsWith('/') && !href.startsWith('//');

const resolveHref = (path: string, hrefOverride?: string): string => {
  if (hrefOverride) {
    if (isInternalHref(hrefOverride)) return hrefOverride;
    console.warn('RelatedBadge: rejecting non-internal hrefOverride', { hrefOverride });
    return '#';
  }
  try {
    return `/${normalizeBadgePath(path)}`;
  } catch (error) {
    // Non-badge paths (e.g. awards) should pass `hrefOverride`; fall back to
    // a non-navigating row rather than crashing the side rail.
    console.warn('RelatedBadge: falling back to "#" — caller should pass hrefOverride', { path, error });
    return '#';
  }
};

export const RelatedBadge = ({
  path,
  hrefOverride,
  badgeName,
  badgeImage,
  programLevel,
  additionalProgramLevels,
  theme,
}: RelatedBadgeProps) => {
  const hasExtraLevels = !!additionalProgramLevels?.length;
  const allLevels = hasExtraLevels ? [programLevel, ...additionalProgramLevels] : [programLevel];
  const href = resolveHref(path, hrefOverride);
  return (
    <Link href={href} className={bem()}>
      {!!badgeImage && (
        <div className={bem('image')}>
          <Image src={badgeImage} alt={badgeName} className={bem('img')} width={48} height={48} />
        </div>
      )}
      <div className={bem('content', { wrap: hasExtraLevels })}>
        <span className={bem('name')}>{badgeName}</span>
        <span className={bem('level', { wrap: hasExtraLevels })}>
          {hasExtraLevels ? (
            <span className={bem('levels-multi')}>
              {allLevels.map((lvl, i) => {
                const Icon = tagIconMapping[lvl.id];
                return (
                  <span key={`${lvl.id}-${i}`} className={bem('level-pair')}>
                    {Icon && (
                      <span className={bem('level-icon')} aria-hidden="true">
                        <Icon />
                      </span>
                    )}
                    <span className={bem('level-name')}>{lvl.level}</span>
                  </span>
                );
              })}
            </span>
          ) : (
            <Tag id={programLevel.id} level={programLevel.id} type="content" />
          )}
          {!hasExtraLevels && !!theme && (
            <>
              <span className={bem('separator')} />
              <span className={bem('theme')}>{theme}</span>
            </>
          )}
        </span>
      </div>
      <div className={bem('icon')}>
        <CaretRightIcon />
      </div>
    </Link>
  );
};
