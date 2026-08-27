import React from 'react';
import { cn } from '@/utils/classNames';
import { Choice } from '@/components/Choice/Choice';
import { ChoiceGroup } from '@/components/ChoiceGroup';
import { CaretDownIcon } from '@/components/Icons/CaretDownIcon';

import './Filter.scss';
import { useFilters } from './useFilters';
import { FilterProps } from './types';

const bem = cn('filter');

export const Filter = (props: FilterProps) => {
  const { options, optionType, optionsPosition = 'right', headerAriaLabel, label, selectedOptions } = props;
  const { ref, focus, open, toggle, handleKeyDownHeader, handleChange, handleKeyDown } = useFilters(props);

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
        <span className={bem('button-label')}>
          {label}
          {!!selectedOptions?.length && <span className={bem('button-counter')}> {selectedOptions.length}</span>}
        </span>
        <span className={bem('button-icon', { open })}>
          <CaretDownIcon className={bem('icon')} />
        </span>
      </button>

      {open && (
        <div className={bem('options', { position: optionsPosition })}>
          <ChoiceGroup type={optionType}>
            {options?.map((choice, index) => (
              <Choice
                key={choice.id}
                {...choice}
                onChange={handleChange(choice)}
                focus={focus?.index === index}
                onKeyDown={handleKeyDown}
                checked={selectedOptions?.some(el => el.id === choice.id)}
              />
            ))}
          </ChoiceGroup>
        </div>
      )}
    </div>
  );
};
