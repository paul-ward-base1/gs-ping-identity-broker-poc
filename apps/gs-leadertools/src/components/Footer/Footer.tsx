'use client';

import { cn } from '@/utils/classNames';

import './Footer.scss';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import { useDebouncedCallback } from '@/utils/useDebouncedCallback';

const bem = cn('footer');

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLDivElement>(null);
  const copyrightText = t('global.footer.copyrightFormat', { year: currentYear });

  const debouncedResize = useDebouncedCallback(() => {
    const footer = footerRef.current;
    const sideRail = document.querySelector('.gs-side-rail');

    if (!footer || !sideRail) {
      return;
    }

    const textNode = footer.querySelector('.gs-footer__text') ?? footer;

    const textRect = textNode.getBoundingClientRect();
    const sideRailRect = sideRail.getBoundingClientRect();

    const overlapping = !(
      textRect.right < sideRailRect.left ||
      textRect.left > sideRailRect.right ||
      textRect.bottom < sideRailRect.top ||
      textRect.top > sideRailRect.bottom
    );

    if (overlapping) {
      footer.style.flexDirection = `column`;
    } else {
      footer.style.removeProperty('flexDirection');
    }
  }, 300);

  useEffect(() => {
    debouncedResize();
    window.addEventListener('resize', debouncedResize);

    return () => window.removeEventListener('resize', debouncedResize);
  }, []);

  return (
    <footer ref={footerRef} className={bem()}>
      <span className={bem('copyright')}>{copyrightText}</span>
      <span className={bem('text')}>{t('global.footer.text')}</span>
    </footer>
  );
};
