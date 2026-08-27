'use client';

import React from 'react';
import { Choice } from '@/components/Choice/Choice';
import './Dropdown.scss';
import { DropdownProps } from '@/components/Dropdown/types';
import { ChoiceGroup } from '@/components/ChoiceGroup';

import { cn } from '@/utils/classNames';
import { useDropdownHandlers } from '@/components/Dropdown/useDropdownHandlers';

import { CaretDownIcon } from '@/components/Icons/CaretDownIcon';

const bem = cn('dropdown');

export const Dropdown = (props: DropdownProps) => {
  const { options, optionType, optionsPosition = 'right', headerAriaLabel } = props;
  const { ref, focus, open, selected, toggle, handleKeyDownHeader, handleChange, handleKeyDown } =
    useDropdownHandlers(props);

  return (
    <div className={bem()} ref={ref}>
      <button
        className={bem('button', { open })}
        onClick={toggle}
        onKeyDown={handleKeyDownHeader}
        aria-label={headerAriaLabel}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className={bem('button-label')}>{options?.find(el => el.id === selected)?.label}</span>
        <span className={bem('button-icon', { open })}>
          <CaretDownIcon className={bem('icon')} />
        </span>
      </button>
      {open && (
        <div className={bem('options', { position: optionsPosition })} role="group">
          <ChoiceGroup type={optionType}>
            {options?.map((choice, index) => (
              <Choice
                key={choice.id}
                {...choice}
                onChange={handleChange(choice)}
                focus={focus?.index === index}
                onKeyDown={handleKeyDown}
                checked={selected === choice.id}
              />
            ))}
          </ChoiceGroup>
        </div>
      )}
    </div>
  );
};
