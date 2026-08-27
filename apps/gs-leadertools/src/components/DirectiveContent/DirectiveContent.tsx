import { cn } from '@/utils/classNames';
import { RichText } from '@/components/RichText';
import { DirectiveContentProps } from './types';
import './DirectiveContent.scss';

const bem = cn('directive-content');

export const DirectiveContent = ({ title, description, descriptionHtml }: Readonly<DirectiveContentProps>) => {
  const hasBody = !!(title || description || descriptionHtml);
  if (!hasBody) return null;

  return (
    <section className={bem()}>
      {!!title && <h2 className={bem('title')}>{title}</h2>}
      {descriptionHtml ? (
        <RichText className={bem('description')} value={descriptionHtml} />
      ) : (
        !!description && <p className={bem('description', { plaintext: true })}>{description}</p>
      )}
    </section>
  );
};
