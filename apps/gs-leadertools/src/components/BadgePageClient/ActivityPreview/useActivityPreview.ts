import { ActivityDetailsProp, ActivityPreviewProps } from '@/components/BadgePageClient/ActivityPreview/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityModel } from '@/types/activity';
import { ButtonProps } from '@/components/Button/types';
import { normalizeActivityPath } from '@/lib/aemContext';
import { createHandouts, createSupplies, mapActivityData } from '@/utils/activityUtils';
import { useAEMFilters } from '@/components/contexts/locale-context';

const getActivityDetails = async (activityPath: string) => {
  try {
    const context = 'activityPreview';
    const res = await fetch(`/api/activity-details?context=${context}&path=${encodeURIComponent(activityPath)}`);

    if (!res.ok) throw new Error('Failed to fetch activity details');

    return await res.json();
  } catch (error) {
    console.error('Error fetching activity details:', error);
    throw new Error('Failed to fetch activity details');
  }
};

export const useActivityPreview = (props: ActivityPreviewProps) => {
  const { isOpen, handleClose, activityPath } = props;
  const { t } = useTranslation();
  const filters = useAEMFilters();
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDetailsProp | null>(null);

  const fetchActivityDetails = async () => {
    setLoading(true);
    const activityDetails: ActivityModel = await getActivityDetails(activityPath);
    if (activityDetails) {
      const fullDetailsButton: ButtonProps = {
        variant: 'primary',
        size: 'large',
        label: t('badgeDetailPage.button.activity.label'),
        ariaLabel: t('badgeDetailPage.button.activity.hintFormat', {
          name: activityDetails.name,
        }),
        link: {
          url: normalizeActivityPath(activityPath),
        },
      };

      const closeButton: ButtonProps = {
        variant: 'tertiary',
        size: 'large',
        label: t('global.button.close.label'),
        icon: 'close',
        ariaLabel: t('global.button.close.hint'),
        onClick: handleClose,
      };
      const supplies = createSupplies(activityDetails, t);

      const handouts = createHandouts(activityDetails, t);

      const finalData: ActivityDetailsProp = mapActivityData(activityDetails, filters?.programLevels ?? []);

      setSelectedActivity({
        ...finalData,
        handouts,
        materials: supplies ?? [],
        fullDetailsButton,
        closeButton,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchActivityDetails();
  }, [isOpen]);

  return {
    loading,
    selectedActivity,
  };
};
