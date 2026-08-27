'use client';

import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { ChoiceProps } from '@/components/Choice/types';
import { FilterProps } from './types';
import { Filter as FilterType } from '@/types/filter';

export const useFilters = ({ options, handleValueChange }: FilterProps) => {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [focus, setFocus] = useState({
    index: -1,
  });

  const ref = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setOpen(prevState => !prevState), []);

  const updateSelectedItems = (prev: string[], id: string): string[] => {
    const isSelected = prev.includes(id);
    if (isSelected) {
      return prev.filter(item => item !== id);
    } else {
      return [...prev, id];
    }
  };

  const handleChange = useCallback(
    (choice: ChoiceProps | FilterType) => () => {
      setSelectedItems(prev => updateSelectedItems(prev, choice.id));
      if (typeof handleValueChange === 'function') handleValueChange(choice as FilterType);
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
    selectedItems,
    focus,
    handleChange,
    toggle,
    handleKeyDown,
    handleKeyDownHeader,
  };
};
