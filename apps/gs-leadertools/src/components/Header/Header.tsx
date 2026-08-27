'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { cn } from '@/utils/classNames';

import './Header.scss';
import { useHeader } from './useHeader';
import { Button } from '@/components/Button';
import { Settings } from '@/components/Settings';
import { AuthControls } from './AuthControls';

const bem = cn('header');

export const Header = () => {
  const { lang, logoAlt, navigationItems, handleSkipToMainClick } = useHeader();

  return (
    <header className={bem()}>
      <Button
        variant="primary"
        size="small"
        onClick={handleSkipToMainClick}
        label="Skip to main content"
        ariaLabel="Skip to main content"
        className={bem('skip-to-main')}
      />
      <div className={bem('content')}>
        <div className={bem('logo')}>
          <Link href={`/${lang}`}>
            <Image
              className={bem('logo-image')}
              src={'/gs_logo.svg'}
              alt={logoAlt}
              width={583}
              height={192}
              priority
              unoptimized
            />
          </Link>
        </div>
        {!!navigationItems?.length && (
          <ul className={bem('nav')}>
            {navigationItems?.map(el => (
              <li key={el.title} className={bem('nav-item')}>
                <Link href={el.url}>{el.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      <AuthControls />
      <Settings />
    </header>
  );
};
