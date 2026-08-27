import { ChangeEvent, KeyboardEvent, useCallback, useId, useRef, useState } from 'react';
import { cn } from '@/utils/classNames';
import { MagnifyingGlass } from '@/components/Icons';
import { Button } from '@/components/Button';

import { SearchBoxProps } from './types';
import './SearchBox.scss';

const bem = cn('search-box');

export const SearchBox = ({ placeholder = 'Search', value, handleSearchChange }: SearchBoxProps) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // Unique per instance: SearchBox is rendered twice on the landing page (mobile +
  // desktop), so a hardcoded id would collide and make <label htmlFor> resolve to the
  // wrong (hidden) input.
  const inputId = useId();

  const handleClear = () => {
    inputRef.current?.focus();
    if (handleSearchChange) handleSearchChange('');
  };

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleSearchChange?.(e.target.value);
    },
    [handleSearchChange]
  );

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  // A native <label> focuses the input on a single tap and reliably raises the iOS
  // keyboard. The previous wrapper used onTouchStart -> inputRef.focus(), which on iOS
  // focuses the field but withholds the keyboard until a second tap (a touchstart is
  // not yet a committed tap).
  return (
    <label
      htmlFor={inputId}
      className={bem({
        focused,
        filled: value !== '',
        active: focused,
      })}
    >
      <MagnifyingGlass className={bem('icon')} />
      <input
        ref={inputRef}
        id={inputId}
        className={bem('input')}
        type="text"
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleInputKeyDown}
      />
      {value && (
        <div className={bem('clear')}>
          <Button variant="icon-only" size="small" onClick={handleClear} icon="cancel-filled" />
        </div>
      )}
    </label>
  );
};
