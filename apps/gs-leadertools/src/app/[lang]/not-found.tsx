'use client';

import React, { useEffect } from 'react';
import { trackError } from '@/utils/gtmTracker';
import { LinkModel } from '@/types/link';
import { StatusMessage } from '@/components/StatusMessage';
import { PageBanner } from '@/components/PageBanner';
import { useTranslation } from 'react-i18next';
import { PageViewTracker } from '@/components/PageViewTracker';

export default function NotFoundPage() {
  const { t } = useTranslation();

  const link: LinkModel = {
    _path: '/',
    title: t('notFoundPage.banner.title'),
  };

  useEffect(() => {
    trackError('404 page not found', 'error_404');
  }, []);

  return (
    <>
      <PageViewTracker contentType="not_found" />
      <PageBanner title={t('notFoundPage.banner.title')} />
      <StatusMessage
        title={t('notFoundPage.section.main.text')}
        buttonLabel={t('notFoundPage.button.home.label')}
        buttonAriaLabel={t('notFoundPage.button.home.hint')}
        buttonLink={link}
      />
    </>
  );
}
