'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn, cx } from '@/utils/classNames';
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretUpIcon,
  ClipboardTextIcon,
  CloseIcon,
  EyeIcon,
  PrinterIcon,
  CaretRightIcon,
  DownloadSimpleIcon,
  CancelFilled,
  FilterIcon,
} from '@/components/Icons';
import { isExternalLink } from '@/utils/isExternalLink';
import { clickTracker } from '@/utils/gtmTracker';
import type { ButtonProps } from './types';
import './Button.scss';

const bem = cn('button');

const iconMap = {
  'arrow-square-out': ArrowSquareOutIcon,
  'arrow-right': ArrowRightIcon,
  eye: EyeIcon,
  'cancel-filled': CancelFilled,
  'caret-left': CaretLeftIcon,
  'caret-right': CaretRightIcon,
  'caret-up': CaretUpIcon,
  'caret-down': CaretDownIcon,
  'clipboard-text': ClipboardTextIcon,
  close: CloseIcon,
  'download-simple': DownloadSimpleIcon,
  filter: FilterIcon,
  printer: PrinterIcon,
};

export const Button = ({
  variant,
  size,
  label,
  labelShort,
  ariaLabel,
  icon,
  disabled,
  fill,
  link,
  onClick,
  ctaType,
  count,
  className = '',
  ariaHasPopup,
  ariaExpanded,
  ariaControls,
}: ButtonProps) => {
  const [isExternal, setIsExternal] = useState(false);
  useEffect(() => {
    setIsExternal(!!(link?.url && isExternalLink(link.url, window.location.hostname)));
  }, [link?.url]);
  const IconComponent = icon ? iconMap[icon] : null;
  const pathname = usePathname();
  const isDetailPage = pathname.includes('/badge/') || pathname.includes('/activity/');

  const handleClick = () => {
    const destinationUrl = link?.url ?? link?._path;

    if (icon !== 'download-simple') {
      clickTracker(ctaType ?? 'details', destinationUrl);
    }

    if (onClick) {
      onClick();
    }
  };

  const buttonContent = (
    <>
      {label && labelShort ? (
        <>
          <span className={bem('label', { mobile: true })}>{labelShort}</span>
          <span className={bem('label', { desktop: true })}>{label}</span>
        </>
      ) : (
        label && <span className={bem('label')}>{label}</span>
      )}
      {!!count && <span className={bem('count')}>{count}</span>}
      {IconComponent && <IconComponent className={bem('icon')} />}
    </>
  );

  const buttonClassName = cx(
    bem({
      [variant]: true,
      [`${variant}-${size}`]: true,
      fill,
    }),
    className
  );

  const commonProps = {
    className: buttonClassName,
    'aria-label': ariaLabel,
    'aria-haspopup': ariaHasPopup,
    'aria-expanded': ariaExpanded,
    'aria-controls': ariaControls,
    onClick: isDetailPage ? handleClick : onClick,
  };

  const handleAuxOrContextClick = (e: React.MouseEvent) => {
    if (!isDetailPage) return;
    if (e.type === 'auxclick' && e.button !== 1) return;
    const destinationUrl = link?.url ?? link?._path;
    if (icon !== 'download-simple') {
      clickTracker(ctaType ?? 'details', destinationUrl);
    }
  };

  return link ? (
    <Link
      {...commonProps}
      href={link.url ?? link._path ?? '#'}
      target={link.target}
      type={link.type}
      aria-disabled={disabled}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      onAuxClick={handleAuxOrContextClick}
      onContextMenu={handleAuxOrContextClick}
    >
      {buttonContent}
    </Link>
  ) : (
    <button {...commonProps} type="button" disabled={disabled}>
      {buttonContent}
    </button>
  );
};
