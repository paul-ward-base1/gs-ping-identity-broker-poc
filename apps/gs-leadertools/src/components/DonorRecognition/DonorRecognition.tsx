import { cn } from '@/utils/classNames';
import { RichText } from '@/components/RichText';
import { buildImagePath } from '@/utils/buildImagePath';
import './DonorRecognition.scss';
import { DonorRecognitionProps } from './types';
import { DonorModel } from '@/types/donorRecognition';
import { useIsAuthorMode } from '@/components/contexts/locale-context';
import { clickTracker } from '@/utils/gtmTracker';

const bem = cn('donor-recognition');

const DonorItem = ({ path, sectionTitle, donorImage, imageUrl, imageTarget, imageAltText, bodyCopy }: DonorModel) => {
  const isAuthorMode = useIsAuthorMode();
  const aueResource =
    isAuthorMode && path
      ? {
          'data-aue-resource': `urn:aemconnection:${path}/jcr:content/data/master`,
          'data-aue-label': sectionTitle ?? 'Donor',
        }
      : {};
  const imgSrc = donorImage?.path ? buildImagePath(donorImage.path) : donorImage?.url;

  const logoElement = imgSrc ? (
    <img
      className={bem('logo')}
      src={imgSrc}
      alt={imageAltText || sectionTitle || ''}
      {...(isAuthorMode && { 'data-aue-prop': 'donorImage', 'data-aue-type': 'media' })}
    />
  ) : null;

  return (
    <div className={bem('item')} {...aueResource}>
      {!!sectionTitle && (
        <p className={bem('title')} {...(isAuthorMode && { 'data-aue-prop': 'sectionTitle', 'data-aue-type': 'text' })}>
          {sectionTitle}
        </p>
      )}
      {logoElement && imageUrl ? (
        <a
          className={bem('logo-link')}
          href={imageUrl}
          target={imageTarget ?? '_self'}
          rel={imageTarget === '_blank' ? 'noopener noreferrer' : undefined}
          onClick={() => clickTracker('sponsor_link', imageUrl)}
        >
          {logoElement}
        </a>
      ) : (
        logoElement
      )}
      {!!bodyCopy?.html && (
        <div
          className={bem('body')}
          {...(isAuthorMode && { 'data-aue-prop': 'bodyCopy', 'data-aue-type': 'richtext' })}
          onClick={e => {
            const anchor = (e.target as HTMLElement).closest('a');
            if (anchor?.href) clickTracker('sponsor_link', anchor.href);
          }}
        >
          <RichText value={bodyCopy.html} />
        </div>
      )}
    </div>
  );
};

export const DonorRecognition = ({ donors }: DonorRecognitionProps) => {
  const visibleDonors = donors.filter(d => !d.hidden);

  if (!visibleDonors.length) return null;

  return (
    <div className={bem()}>
      {visibleDonors.map((donor, index) => (
        <DonorItem key={index} {...donor} />
      ))}
    </div>
  );
};
