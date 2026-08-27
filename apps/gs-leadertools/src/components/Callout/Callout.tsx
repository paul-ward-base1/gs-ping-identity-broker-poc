import Image from 'next/image';
import { cn } from '@/utils/classNames';
import { RichText } from '@/components/RichText';
import { buildImagePath } from '@/utils/buildImagePath';
import { CalloutProps } from './types';
import './Callout.scss';

const bem = cn('callout');

export const Callout = ({
  title,
  description,
  descriptionHtml,
  iconName,
  iconPath,
  iconAlt,
  level,
}: Readonly<CalloutProps>) => {
  const hasBody = !!(title || description || descriptionHtml);
  if (!hasBody) return null;

  const resolvedIconSrc = iconPath ? buildImagePath(iconPath) : '';
  // SVGs are recolored via CSS `mask-image` to follow the level's brand color;
  // raster icons (PNG/JPG) render through `next/image` untouched.
  const isSvgIcon = !!resolvedIconSrc && /\.svg(\?|$)/i.test(iconPath ?? '');
  // Quote + CSS-escape so an AEM-authored path with `)` or `;` can't break
  // out of the inline-style declaration and inject other CSS.
  const maskUrlValue = `url("${resolvedIconSrc
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/[\r\n]/g, '')}")`;

  return (
    <div className={bem({ level: level ?? 'multi' })} data-icon={iconName}>
      {resolvedIconSrc && (
        <div className={bem('icon')}>
          {isSvgIcon ? (
            <span
              className={bem('icon-svg', { mask: true })}
              role="img"
              aria-label={iconAlt ?? iconName ?? ''}
              style={{
                WebkitMaskImage: maskUrlValue,
                maskImage: maskUrlValue,
              }}
            />
          ) : (
            <Image
              className={bem('icon-svg')}
              src={resolvedIconSrc}
              alt={iconAlt ?? iconName ?? ''}
              width={32}
              height={32}
            />
          )}
        </div>
      )}
      <div className={bem('content')}>
        {!!title && <div className={bem('title')}>{title}</div>}
        {descriptionHtml ? (
          <RichText className={bem('description')} value={descriptionHtml} />
        ) : (
          !!description && <div className={bem('description', { plaintext: true })}>{description}</div>
        )}
      </div>
    </div>
  );
};
