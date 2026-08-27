import React from 'react';
import { cn } from '@/utils/classNames';
import { CancelFilledIcon } from '@/components/Icons/CancelFilledIcon';
import { FilterChipsProps } from './types';
import './FilterChips.scss';

const bem = cn('filter-chips');

export const FilterChips = ({ label, onClick }: FilterChipsProps) => {
  return (
    <button type="button" className={bem()} onClick={onClick}>
      <span className={bem('label')}>{label}</span>
      <CancelFilledIcon className={bem('icon')} />
    </button>
  );
};
