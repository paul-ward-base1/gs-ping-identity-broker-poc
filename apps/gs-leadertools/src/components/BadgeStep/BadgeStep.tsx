'use client';

import { cn } from '@/utils/classNames';
import { Accordion } from '@/components/Accordion';
import { RichText } from '@/components/RichText';
import { ActivityContentModule } from '@/components/ActivityPageClient/ActivityContentModule';
import './BadgeStep.scss';
import { BadgeStepProps } from './types';
import React from 'react';
import { useIsAuthorMode } from '@/components/contexts/locale-context';

const bem = cn('badge-step');

export const BadgeStep = ({ step, stepNumber, badgeProgramLevel, accordionTitle, printAction }: BadgeStepProps) => {
  const isAuthorMode = useIsAuthorMode();
  const nameUeAttrs = isAuthorMode
    ? { 'data-aue-prop': 'name', 'data-aue-type': 'text', 'data-aue-label': 'Name' }
    : undefined;

  const descriptionUeAttrs = isAuthorMode
    ? {
        'data-aue-prop': 'description',
        'data-aue-type': step.descriptionHtml ? 'richtext' : 'text',
        'data-aue-label': 'Description',
      }
    : undefined;

  const description = step.descriptionHtml ? (
    <RichText className={bem('description')} value={step.descriptionHtml} {...descriptionUeAttrs} />
  ) : (
    <div className={bem('description', { plaintext: true })} {...descriptionUeAttrs}>
      {step.description}
    </div>
  );

  const stepBody = (
    <>
      {/* Mobile-only header: counter + name inline */}
      <div className={bem('info-mobile')}>
        <div className={bem('counter-mobile')}>
          <span className={bem('number')}>{stepNumber} </span>
        </div>
        <div className={bem('name', { mobile: true })}>{step.name}</div>
      </div>

      {/* Desktop-only name (above description). UE binds here. */}
      <div className={bem('name', { desktop: true })} {...nameUeAttrs}>
        {step.name}
      </div>

      {/* Single description shared by both breakpoints */}
      {description}
    </>
  );

  const content =
    isAuthorMode && step.path ? (
      <div data-aue-resource={`urn:aemconnection:${step.path}/jcr:content/data/master`} data-aue-label={step.name}>
        {stepBody}
      </div>
    ) : (
      stepBody
    );

  return (
    <div className={bem()}>
      <div className={bem('counter-desktop')}>
        <span className={bem('number')}>{stepNumber} </span>
      </div>
      <div className={bem('content')}>
        {content}

        {!!step.activities?.length && (
          <div className={bem('activities')}>
            <Accordion
              title={accordionTitle ?? ''}
              items={step.activities}
              level={badgeProgramLevel}
              defaultOpen={stepNumber === 1 || printAction || isAuthorMode}
              printAction={printAction}
            />
          </div>
        )}

        {!!step.contentModules?.length && (
          <div className={bem('modules')}>
            {step.contentModules.map((module, idx) => (
              <ActivityContentModule key={`${module.type}-${module.path ?? idx}`} {...module} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
