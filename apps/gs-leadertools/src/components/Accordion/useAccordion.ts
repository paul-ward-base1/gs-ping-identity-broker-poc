import { AccordionProps } from './types';
import { useCallback, useMemo, useState } from 'react';

export const useAccordion = (props: AccordionProps) => {
  const { items, defaultOpen } = props;

  const [open, setOpen] = useState(defaultOpen);

  const itemsCount = useMemo(() => {
    return items?.length;
  }, []);

  const toggleAccordion = useCallback(() => {
    setOpen(prev => !prev);
  }, []);

  return {
    open,
    itemsCount,
    toggleAccordion,
  };
};
