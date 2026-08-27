'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CaretDownIcon, GearIcon, GlobeIcon } from '@/components/Icons';
import { cn } from '@/utils/classNames';
import { useHeader } from '@/components/Header/useHeader';
import { LanguageModal } from './LanguageModal';
import './Settings.scss';

const bem = cn('settings');

export const Settings = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasModalOpen = useRef(false);

  const { settingsLabel, settingsAriaLabel, languageSwitcherTitle } = useHeader();

  // Close the menu on outside click or Escape (Escape returns focus to the button).
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  // Return focus to the Settings button once the language modal closes.
  useEffect(() => {
    if (!modalOpen && wasModalOpen.current) buttonRef.current?.focus();
    wasModalOpen.current = modalOpen;
  }, [modalOpen]);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const openLanguageModal = useCallback(() => {
    setMenuOpen(false);
    setModalOpen(true);
  }, []);

  return (
    <div className={bem()} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        className={bem('button', { open: menuOpen })}
        onClick={() => setMenuOpen(open => !open)}
        aria-label={settingsAriaLabel}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
      >
        <GearIcon className={bem('icon')} aria-hidden="true" />
        <span className={bem('button-label')}>{settingsLabel}</span>
        <span className={bem('button-icon', { open: menuOpen })}>
          <CaretDownIcon className={bem('caret')} />
        </span>
      </button>
      {menuOpen && (
        <ul className={bem('menu')} role="menu">
          <li role="none">
            <button type="button" role="menuitem" className={bem('menu-item')} onClick={openLanguageModal}>
              <GlobeIcon className={bem('menu-item-icon')} aria-hidden="true" />
              {languageSwitcherTitle}
            </button>
          </li>
        </ul>
      )}
      <LanguageModal isOpen={modalOpen} onClose={closeModal} />
    </div>
  );
};
