import { Accordion } from '@/components/Accordion';
import { ParsedAccordionContent } from '../types';
import { cn } from '@/utils/classNames';
import { useIsAuthorMode } from '@/components/contexts/locale-context';

const bem = cn('activity-details-page');

export const AccordionModule = ({ title, level, header, items, defaultOpen }: ParsedAccordionContent) => {
  const isAuthorMode = useIsAuthorMode();
  return (
    <div className={bem('accordion')}>
      {/* Author mode keeps the empty heading visible so it stays editable in AEM. */}
      {(isAuthorMode || !!title) && (
        <h2
          className={bem('accordion-title')}
          {...(isAuthorMode && { 'data-aue-prop': 'header', 'data-aue-type': 'text' })}
        >
          {title}
        </h2>
      )}
      <Accordion level={level} title={header ?? ''} items={items ?? []} variant="richText" defaultOpen={defaultOpen} />
    </div>
  );
};
