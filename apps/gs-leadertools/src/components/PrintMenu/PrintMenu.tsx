'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/utils/classNames';
import { Button } from '@/components/Button';
import './PrintMenu.scss';

const bem = cn('print-menu');

export interface PrintMenuProps {
  /** Trigger button label (e.g. "Print page"). */
  triggerLabel?: string;
  triggerAriaLabel?: string;
  disabled?: boolean;
  /** Prints in the chosen mode: `true` = color, `false` = black & white. */
  onPrint: (color: boolean) => void;
  blackWhiteLabel: string;
  colorLabel: string;
}

// Print dropdown: the button opens a menu to print in "Black and White" or "Color".
// Implements the WAI-ARIA menu-button pattern (focus moves into the menu, arrow
// keys roam, Escape/Tab close and restore focus to the trigger).
export const PrintMenu = ({
  triggerLabel,
  triggerAriaLabel,
  disabled,
  onPrint,
  blackWhiteLabel,
  colorLabel,
}: PrintMenuProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const options: { value: boolean; label: string }[] = [
    { value: false, label: blackWhiteLabel },
    { value: true, label: colorLabel },
  ];

  const focusTrigger = () => containerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();

  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) focusTrigger();
  };

  // Move focus to the first item when the menu opens; close on outside click.
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const select = (color: boolean) => {
    close();
    onPrint(color);
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
    if (!items.length) return;
    const current = items.indexOf(document.activeElement as HTMLButtonElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        items[(current + 1) % items.length]?.focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        items[(current - 1 + items.length) % items.length]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case 'Escape':
        event.preventDefault();
        close();
        break;
      case 'Tab':
        // Let focus leave naturally, but collapse the menu.
        close(false);
        break;
    }
  };

  return (
    <div className={bem({ open })} ref={containerRef}>
      <Button
        variant="tertiary"
        size="small"
        ctaType="print"
        icon="caret-down"
        label={triggerLabel}
        ariaLabel={triggerAriaLabel}
        disabled={disabled}
        ariaHasPopup="menu"
        ariaExpanded={open}
        ariaControls={open ? menuId : undefined}
        onClick={() => setOpen(prev => !prev)}
      />
      {open && (
        <div
          id={menuId}
          className={bem('menu')}
          role="menu"
          aria-label={triggerLabel}
          ref={menuRef}
          onKeyDown={handleMenuKeyDown}
        >
          {options.map(option => (
            <button
              key={String(option.value)}
              type="button"
              role="menuitem"
              className={bem('option')}
              onClick={() => select(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
