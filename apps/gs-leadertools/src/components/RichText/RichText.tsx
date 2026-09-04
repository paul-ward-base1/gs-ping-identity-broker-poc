import './RichText.scss';
import React, { useMemo } from 'react';
import { cn } from '@/utils/classNames';
import { richTextDangerousHtml } from '@/utils/sanitizeHtml';

const bem = cn('rich-text');

interface RichTextProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const RichText = React.memo(({ value, className, ...rest }: RichTextProps) => {
  const mergedClassName = className ? `${bem()} ${className}` : bem();
  const dangerousHtml = useMemo(() => richTextDangerousHtml(value), [value]);
  return <div {...rest} className={mergedClassName} dangerouslySetInnerHTML={dangerousHtml} />;
});

RichText.displayName = 'RichText';
