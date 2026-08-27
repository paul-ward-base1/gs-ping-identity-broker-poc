import { RichText } from '@/components/RichText';
import type { ParsedRichTextContent } from '../types';

export const RichTextModule = ({ content }: ParsedRichTextContent) => (
  <RichText value={content ?? ''} />
);
