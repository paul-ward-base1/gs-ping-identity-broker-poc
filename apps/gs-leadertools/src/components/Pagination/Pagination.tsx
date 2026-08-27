import { cn } from '@/utils/classNames';

import { PaginationProps } from './types';
import './Pagination.scss';
import { Button } from '@/components/Button';

const bem = cn('pagination');

export const Pagination = ({
  suffixLabel,
  prefixLabel,
  resultsLabel,
  handlePrevious,
  disabledPrevious,
  handleNext,
  disabledNext,
  ariaLabelNext,
  ariaLabelPrev,
}: PaginationProps) => {
  return (
    <div className={bem()}>
      <div className={bem('label')}>
        <span className={bem('prefix')}>{prefixLabel}</span>
        <span className={bem('results')}>{resultsLabel}</span>
        <span className={bem('suffix')}>{suffixLabel}</span>
      </div>

      <Button
        variant={'icon-only'}
        onClick={handlePrevious}
        disabled={disabledPrevious}
        icon={'caret-left'}
        ariaLabel={ariaLabelPrev}
      />
      <Button
        variant={'icon-only'}
        onClick={handleNext}
        disabled={disabledNext}
        icon={'caret-right'}
        ariaLabel={ariaLabelNext}
      />
    </div>
  );
};
