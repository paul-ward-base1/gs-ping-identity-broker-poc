import { cn } from '@/utils/classNames';
import { SideRailHandout } from '@/components/SideRailBox/SideRailHandout';
import { SideRailHandoutsProps } from '@/components/SideRailBox/types';
import { DownloadAllButton } from '@/components/DownloadAllButton';
import { getDownloadableUrls } from '@/utils/getDownloadableUrls';

const bem = cn('side-rail-box');

export const SideRailHandouts = ({ header, handouts }: SideRailHandoutsProps) => {
  const downloadableUrls = getDownloadableUrls(handouts ?? []);

  return (
    <div className={bem('handouts')}>
      <div className={bem('handouts-header')}>{header}</div>
      {handouts?.map(handout => <SideRailHandout key={handout.title} {...handout} />)}
      {downloadableUrls.length > 1 && <DownloadAllButton variant="footer" urls={downloadableUrls} />}
    </div>
  );
};
