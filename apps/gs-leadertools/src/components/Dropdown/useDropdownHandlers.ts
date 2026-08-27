'use client';

import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { ChoiceProps } from '@/components/Choice/types';
import { DropdownProps } from '@/components/Dropdown/types';

export const useDropdownHandlers = ({ value, options, handleValueChange }: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(value);
  const [focus, setFocus] = useState({
    index: -1,
  });

  const ref = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setOpen(prevState => !prevState), []);

  const handleChange = useCallback(
    (choice: ChoiceProps) => () => {
      setSelected(choice.id);
      if (typeof handleValueChange === 'function') handleValueChange(choice.id);
      setOpen(false); // optional: close after selection
    },
    []
  );

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    },
    [ref]
  );

  const handleCloseKeyboardNav = useCallback(() => {
    setFocus({ index: -1 });
    setOpen(false);
  }, []);

  const setFocusOption = useCallback(
    (index: number) => {
      if (options[index]) {
        setFocus({ index });
      }
    },
    [options]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          handleCloseKeyboardNav();
          break;
        case 'ArrowDown':
          setFocusOption(focus.index + 1);
          break;
        case 'ArrowUp':
          if (focus.index === 0) {
            handleCloseKeyboardNav();
          }
          setFocusOption(focus.index - 1);
          break;
        case 'Escape':
        case 'Tab':
          handleCloseKeyboardNav();
          break;
      }
    },
    [focus, options, handleCloseKeyboardNav]
  );

  const handleKeyDownHeader = useCallback((e: { key: string; preventDefault: () => void }) => {
    switch (e.key) {
      case 'Enter': {
        e.preventDefault();
        setOpen(true);
        break;
      }
      case 'ArrowDown':
        setOpen(true);
        setFocus({ index: 0 });
        break;
      case 'ArrowUp':
      case 'Escape':
        setOpen(false);
        break;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return {
    ref,
    open,
    selected,
    focus,
    handleChange,
    toggle,
    handleKeyDown,
    handleKeyDownHeader,
  };
};
