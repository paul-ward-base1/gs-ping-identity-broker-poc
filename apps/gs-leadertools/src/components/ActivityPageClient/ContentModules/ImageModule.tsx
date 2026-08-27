import Image from 'next/image';
import { cn } from '@/utils/classNames';
import { buildImagePath } from '@/utils/buildImagePath';
import { ParsedImageContent } from '../types';
import { useIsAuthorMode } from '@/components/contexts/locale-context';

const bem = cn('activity-details-page');

export const ImageModule = ({ file, label }: ParsedImageContent) => {
  const isAuthorMode = useIsAuthorMode();
  return (
    <div className={bem('image')}>
      <Image
        src={buildImagePath(file.path)}
        alt={label ?? ''}
        fill
        style={{ objectFit: 'cover' }}
        {...(isAuthorMode && { 'data-aue-prop': 'file', 'data-aue-type': 'media' })}
      />
      {label && <span {...(isAuthorMode && { 'data-aue-prop': 'label', 'data-aue-type': 'text' })}>{label}</span>}
    </div>
  );
};
