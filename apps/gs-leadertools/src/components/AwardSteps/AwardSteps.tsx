import { cn } from '@/utils/classNames';
import { AwardStep } from '@/components/AwardStep';
import { AwardStepClientProps } from '@/components/AwardStep/types';
import { AwardStepsProps } from './types';
import './AwardSteps.scss';

const bem = cn('award-steps');

export const AwardSteps = ({
  title,
  description,
  steps,
  badgeProgramLevel,
  accordionTitle,
  printAction,
}: AwardStepsProps) => {
  return (
    <div className={bem()}>
      {(!!title || !!description) && (
        <div className={bem('header')}>
          {!!title && <div className={bem('title')}>{title}</div>}
          {!!description && <div className={bem('description')}>{description}</div>}
        </div>
      )}
      <div className={bem('items')}>
        {steps?.map((step: AwardStepClientProps, index: number) => (
          <AwardStep
            key={`${step.name}-${index}`}
            step={step}
            stepNumber={index + 1}
            accordionTitle={accordionTitle}
            badgeProgramLevel={badgeProgramLevel}
            printAction={printAction}
          />
        ))}
      </div>
    </div>
  );
};
