import React from 'react';

import { cn } from '@/utils/classNames';
import { AccordionItem } from '@/components/AccordionItem';
import { RichText } from '@/components/RichText';

import { CaretDownIcon } from '@/components/Icons';
import { AccordionProps } from './types';
import { useAccordion } from './useAccordion';
import './Accordion.scss';

const bem = cn('accordion');

export const Accordion = (props: AccordionProps) => {
  const { title, items, level, variant = 'default', useChildrenContent, children, count } = props;
  const { open, itemsCount, toggleAccordion } = useAccordion(props);

  return (
    <div className={bem({ open })}>
      <button className={bem('header', { level })} aria-expanded={open} onClick={toggleAccordion}>
        <div className={bem('data')}>
          <span className={bem('title')}>{title}</span>
          {(!!itemsCount || !!count) && <span className={bem('count')}>{itemsCount ?? count}</span>}
        </div>
        <span className={bem('icon')}>
          <CaretDownIcon />
        </span>
      </button>

      <div className={bem('content')} aria-hidden={!open} inert={!open || undefined}>
        {useChildrenContent
          ? children
          : items?.map((item, index) => (
              <React.Fragment key={`${item?.title ?? item.value}-${index}`}>
                {variant === 'default' ? <AccordionItem {...item} /> : <RichText value={item.value ?? ''} />}
                {index !== items.length - 1 && <div className={bem('separator')} />}
              </React.Fragment>
            ))}
      </div>
    </div>
  );
};
