import './RichText.scss';
import React from 'react';
import { cn } from '@/utils/classNames';
import { richTextDangerousHtml } from '@/utils/sanitizeHtml';

const bem = cn('rich-text');

interface RichTextProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const RichText = ({ value, className, ...rest }: RichTextProps) => {
  const mergedClassName = className ? `${bem()} ${className}` : bem();
  return <div {...rest} className={mergedClassName} dangerouslySetInnerHTML={richTextDangerousHtml(value)} />;
};
