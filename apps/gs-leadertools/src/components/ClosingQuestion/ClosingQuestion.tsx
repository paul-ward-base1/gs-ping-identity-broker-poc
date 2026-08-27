import { cn } from '@/utils/classNames';
import { QuestionIcon } from '@/components/Icons';
import './ClosingQuestion.scss';
import { ClosingQuestionProps } from './types';
import { RichText } from '@/components/RichText';
import { useIsAuthorMode } from '@/components/contexts/locale-context';

const bem = cn('closing-question');

export function ClosingQuestion({
  title,
  description,
  questionText,
  questions,
  uePath,
  ueLabel,
}: Readonly<ClosingQuestionProps>) {
  const isAuthorMode = useIsAuthorMode();
  const aueResource =
    isAuthorMode && uePath
      ? { 'data-aue-resource': `urn:aemconnection:${uePath}/jcr:content/data/master`, 'data-aue-label': ueLabel }
      : {};

  const extraQuestions = questions && questions.length > 1 ? questions.slice(1) : [];

  return (
    <div className={bem()} {...aueResource}>
      <div className={bem('header')}>
        <h2
          className={bem('title')}
          {...(isAuthorMode && {
            'data-aue-prop': 'closingQuestionTitle',
            'data-aue-type': 'text',
            'data-aue-label': 'Closing Question Title',
          })}
        >
          {title}
        </h2>
        <RichText
          value={description}
          {...(isAuthorMode && {
            'data-aue-prop': 'closingQuestionDescription',
            'data-aue-type': 'richtext',
            'data-aue-label': 'Closing Question Description',
          })}
        />
      </div>
      {!!questionText && (
        <div className={bem('question')}>
          <>
            <div className={bem('icon-container')}>
              <QuestionIcon />
            </div>
            <span
              className={bem('question-text')}
              {...(isAuthorMode && {
                'data-aue-prop': 'closingQuestionContent',
                'data-aue-type': 'text',
                'data-aue-label': 'Closing Question Text',
              })}
            >
              {questionText}
            </span>
          </>
        </div>
      )}
      {extraQuestions.map((q, idx) => (
        <div key={`${q}-${idx + 1}`} className={bem('question')}>
          <div className={bem('icon-container')}>
            <QuestionIcon />
          </div>
          <span className={bem('question-text')}>{q}</span>
        </div>
      ))}
    </div>
  );
}
