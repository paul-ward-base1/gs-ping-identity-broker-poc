'use client';
import React, {
  ChangeEvent,
  forwardRef,
  Ref,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { cn, cx } from '@/utils/classNames';
import './Choice.scss';
import { ChoiceProps } from './types';

const bem = cn('choice');

export const Choice = forwardRef((props: ChoiceProps, ref: Ref<HTMLInputElement>) => {
  const { id, label, name, type = 'checkbox', disabled, value, focus } = props;
  const { className, checked = false, ariaLabel } = props;
  const { onChange, onBlur, onKeyDown } = props;

  const [internalFocus, setInternalFocus] = useState(focus);

  const evaluatedValue = value ?? label;

  const $input = useRef<HTMLInputElement>(null);

  const classNames = cx(bem({ type, disabled, focused: internalFocus }), className);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if ($input.current) $input.current.checked = event.target.checked;

      if (typeof onChange === 'function') onChange(event.target.checked);
    },
    [onChange]
  );

  const handleBlur = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setInternalFocus(false);
      if (typeof onBlur === 'function') onBlur(event.target.checked);
    },
    [onBlur]
  );

  const handleFocus = useCallback(() => {
    setInternalFocus(true);
  }, []);

  useEffect(() => {
    if ($input.current) $input.current.checked = checked;
  }, [checked]);

  useEffect(() => {
    if (focus && $input.current) $input.current?.focus();
  }, [focus]);

  useImperativeHandle(ref, () => $input.current as HTMLInputElement, []);

  return (
    <div className={classNames}>
      <input
        ref={$input}
        className={bem('input')}
        id={id}
        name={name}
        type={type}
        value={evaluatedValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        onFocus={handleFocus}
        onKeyDown={onKeyDown}
        aria-label={ariaLabel ?? label}
      />
      <label className={bem('label')} htmlFor={id}>
        {label}
      </label>
    </div>
  );
});
