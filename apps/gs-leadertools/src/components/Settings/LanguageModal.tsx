'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CloseIcon } from '@/components/Icons';
import { Choice } from '@/components/Choice';
import { cn } from '@/utils/classNames';
import { useOverlay } from '@/utils/useOverlay';
import { useHeader } from '@/components/Header/useHeader';
import './LanguageModal.scss';

const bem = cn('language-switcher');
const WIDGET_ID = 'GLGOLanguageSelector';

// OneLink labels carry a region suffix ("Español (Estados Unidos)") while our
// dictionary labels are short names ("Español"), so map by prefix, not equality.
export const labelToLangId = (label: string | null | undefined, items: { id: string; label: string }[]) => {
  const text = label?.trim().toLowerCase() ?? '';
  if (!text) return undefined;
  return items.find(item => text.startsWith(item.label.trim().toLowerCase()))?.id;
};

type LanguageModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const LanguageModal = ({ isOpen, onClose }: LanguageModalProps) => {
  const uid = useId();
  const titleId = `lang-modal-title-${uid}`;
  const closeRef = useRef<HTMLButtonElement>(null);

  const { lang, languageItems, languagePickerAriaLabel, languageSwitcherTitle, languageSwitcherCloseLabel } =
    useHeader();

  // The URL locale no longer changes when switching (OneLink translates in place),
  // so the modal's selection tracks OneLink's actual language, seeded from the URL.
  const [selectedLang, setSelectedLang] = useState(lang);
  const languageItemsRef = useRef(languageItems);
  useEffect(() => {
    languageItemsRef.current = languageItems;
  }, [languageItems]);

  useOverlay(isOpen);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const els = ['main', '.gs-header', '.gs-footer']
      .map(sel => document.querySelector<HTMLElement>(sel))
      .filter((el): el is HTMLElement => el !== null);
    els.forEach(el => el.setAttribute('inert', ''));
    return () => els.forEach(el => el.removeAttribute('inert'));
  }, [isOpen]);

  // The OneLink widget is no longer the language entry point — selection now lives
  // in the Settings menu — so keep it permanently hidden while still relying on it
  // to perform the actual translation. The observer re-hides it if OneLink removes
  // and re-injects the widget (e.g. after React's hydration recovery wipes its div).
  useEffect(() => {
    const hide = (el: HTMLElement) => {
      el.style.visibility = 'hidden';
      el.style.pointerEvents = 'none';
    };
    const existing = document.getElementById(WIDGET_ID);
    if (existing) hide(existing);
    const observer = new MutationObserver(() => {
      const widget = document.getElementById(WIDGET_ID);
      if (widget && widget.style.visibility !== 'hidden') hide(widget);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Read OneLink's current language from its selector and mirror it into state so
  // the modal's checked option reflects the language actually shown — including
  // OneLink's own changes (cookie-based auto-translate on load, or our delegated
  // click). Read-only: OneLink owns the widget's label now that it does the switch.
  useEffect(() => {
    const readSelected = () => {
      const widget = document.getElementById(WIDGET_ID);
      const selected = widget?.querySelector<HTMLElement>('.oljs-select-selected');
      if (!widget || !selected) return false;
      const id = labelToLangId(selected.textContent, languageItemsRef.current);
      if (id) setSelectedLang(id);
      return true;
    };

    let selectedObserver: MutationObserver | undefined;
    const watch = () => {
      const widget = document.getElementById(WIDGET_ID);
      if (!widget) return;
      selectedObserver = new MutationObserver(readSelected);
      selectedObserver.observe(widget, { childList: true, subtree: true, characterData: true });
    };

    if (readSelected()) {
      watch();
      return () => selectedObserver?.disconnect();
    }

    // Widget not injected yet: wait for OneLink, then read and watch.
    const waitObserver = new MutationObserver(() => {
      if (readSelected()) {
        waitObserver.disconnect();
        watch();
      }
    });
    waitObserver.observe(document.body, { childList: true, subtree: true });
    return () => {
      waitObserver.disconnect();
      selectedObserver?.disconnect();
    };
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      onClose();
      const widget = document.getElementById(WIDGET_ID);
      const items = Array.from(widget?.querySelectorAll<HTMLElement>('.oljs-select-items > div') ?? []);
      const targetLabel =
        languageItems
          .find(item => item.id === id)
          ?.label.trim()
          .toLowerCase() ?? '';
      // OneLink labels carry a region suffix ("Español (Estados Unidos)") while our
      // dictionary label is the short name ("Español"), so match by prefix not equality.
      const match = targetLabel
        ? items.find(opt => opt.textContent?.trim().toLowerCase().startsWith(targetLabel))
        : undefined;
      if (match) {
        // Reflect the choice immediately; the widget observer confirms it once
        // OneLink repaints its selected label.
        setSelectedLang(id);
        match.click();
      }
    },
    [languageItems, onClose]
  );

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className={bem('overlay')} onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={bem('modal')}
        onClick={e => e.stopPropagation()}
      >
        <div className={bem('header')}>
          <span id={titleId} className={bem('title')}>
            {languageSwitcherTitle}
          </span>
          <button ref={closeRef} className={bem('close')} onClick={onClose} aria-label={languageSwitcherCloseLabel}>
            {languageSwitcherCloseLabel} <CloseIcon />
          </button>
        </div>
        <div className={bem('options')} role="radiogroup" aria-label={languagePickerAriaLabel}>
          {languageItems.map(option => (
            <Choice
              key={option.id}
              id={option.id}
              label={option.label}
              type="radio"
              checked={option.id === selectedLang}
              ariaLabel={option.ariaLabel}
              onChange={() => handleSelect(option.id)}
            />
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
