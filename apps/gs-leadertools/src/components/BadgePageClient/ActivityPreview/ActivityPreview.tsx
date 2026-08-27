import { useTranslation } from 'react-i18next';

import { cn } from '@/utils/classNames';
import { Modal } from '@/components/Modal';
import { LoadingScreen } from '@/components/LoadingScreen';
import { AccordionItem } from '@/components/AccordionItem';
import { PaintBrush } from '@/components/Icons';
import { Supply } from '@/components/Supply';
import { Handout } from '@/components/Handout';
import { HandoutCardProps } from '@/components/Handouts/types';

import { ActivityPreviewProps } from './types';
import { useActivityPreview } from './useActivityPreview';
import './ActivityPreview.scss';

const bem = cn('activity-preview');

export const ActivityPreview = (props: ActivityPreviewProps) => {
  const { isOpen } = props;
  const { t } = useTranslation();
  const { loading, selectedActivity } = useActivityPreview(props);

  return (
    <Modal
      isOpen={isOpen}
      fullDetailsButton={selectedActivity?.fullDetailsButton}
      closeButton={selectedActivity?.closeButton}
      title={t('badgeDetailPage.activityPreviewModal.header')}
    >
      {loading ? (
        <LoadingScreen />
      ) : (
        <div className={bem()}>
          <div className={bem('section')}>
            <AccordionItem
              title={selectedActivity?.name ?? ''}
              tags={selectedActivity?.tags}
              hasAllLevels={selectedActivity?.hasAllLevels}
              timeRange={selectedActivity?.timeRange}
              showBullet={false}
            />
            {!!selectedActivity?.description && (
              <div className={bem('description')}>{selectedActivity?.description}</div>
            )}
          </div>
          {!!selectedActivity?.materials?.length && (
            <>
              <div className={bem('separator')} />
              <div className={bem('section')}>
                <div className={bem('supplies')}>
                  <div className={bem('resources-header')}>
                    <span className={bem('icon')}>
                      <PaintBrush />
                    </span>
                    <span className={bem('supplies-label')}>
                      {t('activityDetailPage.sideRail.suppliesAndHandouts.header')}
                    </span>
                    <span className={bem('counter')}>
                      {selectedActivity.materials.length + (selectedActivity?.handouts?.length ?? 0)}
                    </span>
                  </div>
                  {!!selectedActivity.materials.length && (
                    <div className={bem('supplies-items')}>
                      {selectedActivity.materials.map((el, index) => {
                        return <Supply key={`${el.label}-${index}`} {...el} />;
                      })}

                      {selectedActivity.handouts?.map((card: HandoutCardProps, index) => {
                        return <Handout key={`${card.title}-${index}`} {...card} />;
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};
