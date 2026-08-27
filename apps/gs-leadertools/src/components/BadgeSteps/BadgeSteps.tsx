import { cn } from '@/utils/classNames';
import { BadgeStep } from '@/components/BadgeStep';
import './BadgeSteps.scss';
import { BadgeStepsProps } from '@/components/BadgeSteps/types';
import { BadgeStepClientProps } from '@/components/BadgePageClient/types';

const bem = cn('badge-steps');

export const BadgeSteps = ({
  title,
  description,
  steps,
  badgeProgramLevel,
  accordionTitle,
  printAction,
}: BadgeStepsProps) => {
  return (
    <div className={bem()}>
      {(!!title || !!description) && (
        <div className={bem('header')}>
          {!!title && <div className={bem('title')}>{title}</div>}
          {!!description && <div className={bem('description')}>{description}</div>}
        </div>
      )}
      <div className={bem('items')}>
        {steps?.map((step: BadgeStepClientProps, index: number) => (
          <BadgeStep
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
