'use client';

import React, { useEffect } from 'react';
import { trackError } from '@/utils/gtmTracker';
import { StatusMessage } from '@/components/StatusMessage';
import { PageBanner } from '@/components/PageBanner';
import { useTranslation } from 'react-i18next';
import { PageViewTracker } from '@/components/PageViewTracker';

export default function ServerErrorPage() {
  const { t } = useTranslation();

  const handleRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    trackError('Server error', 'server_error');
  }, []);

  return (
    <>
      <PageViewTracker contentType="error" />
      <PageBanner title={t('errorPage.banner.title')} />
      <StatusMessage
        title={t('errorPage.section.main.text')}
        buttonLabel={t('errorPage.button.refresh.label')}
        buttonAriaLabel={t('errorPage.button.refresh.hint')}
        onClick={handleRefresh}
      />
    </>
  );
}
