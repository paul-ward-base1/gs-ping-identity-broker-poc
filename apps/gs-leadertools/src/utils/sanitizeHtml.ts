import DOMPurify, { type Config } from 'isomorphic-dompurify';
import { getAemBase } from '@/lib/aemBase';
import { buildImagePath } from '@/utils/buildImagePath';

const AEM_PATH_PREFIXES = ['/content/dam/', '/content/'];

const isAemRelativeUrl = (value: string | null): boolean => {
  if (!value) return false;
  return AEM_PATH_PREFIXES.some(p => value.startsWith(p));
};

/**
 * Rewrite an AEM-relative URL to an absolute AEM origin URL. Used for anchor
 * hrefs (downloadable assets) where the browser must hit AEM directly.
 */
const resolveAemUrl = (value: string): string => {
  const base = getAemBase();
  if (!base) return value;
  const trimmed = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${trimmed}${value}`;
};

/**
 * Rewrite an AEM-relative image src to the local `/img/...` proxy added by
 * VTKN-423. The proxy hides the AEM origin from the browser, applies the
 * shared TLS config, and resizes/transcodes via sharp. Image src must NEVER
 * resolve to an absolute AEM URL — that would defeat the security goal.
 */
const resolveAemImageSrc = (value: string): string => buildImagePath(value);

const isSafeHref = (href: string | null): boolean => {
  if (!href) return false;
  const v = href.trim().toLowerCase();
  if (v.startsWith('javascript:') || v.startsWith('data:') || v.startsWith('vbscript:')) {
    return false;
  }
  return true;
};

const isAbsoluteHttpHref = (href: string | null): boolean => {
  if (!href) return false;
  // Only treat URLs with an explicit http(s):// scheme as external. Bare
  // `www.example.com` is left untouched — browsers resolve it relative to the
  // current path, so tagging it as external would be misleading.
  return /^https?:\/\//i.test(href);
};

const afterSanitizeAttributesHook = (node: Element) => {
  if (node.tagName === 'A') {
    const a = node as HTMLAnchorElement;
    const href = a.getAttribute('href');
    if (href && !isSafeHref(href)) {
      a.removeAttribute('href');
    } else if (href && isAemRelativeUrl(href)) {
      a.setAttribute('href', resolveAemUrl(href));
    }
    if (a.getAttribute('href') && isAbsoluteHttpHref(a.getAttribute('href'))) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.setAttribute('data-external', 'true');
    }
  }

  if (node.tagName === 'IMG') {
    const img = node as HTMLImageElement;
    const src = img.getAttribute('src');
    if (src && isAemRelativeUrl(src)) {
      img.setAttribute('src', resolveAemImageSrc(src));
    }
    img.removeAttribute('onerror');
    img.removeAttribute('onload');
    if (!img.getAttribute('alt')) img.setAttribute('alt', '');
  }
};

// Idempotent registration: store a sentinel on globalThis so HMR re-imports
// don't stack duplicate hooks, while leaving any hooks registered by other
// modules untouched.
const HOOK_SENTINEL = Symbol.for('vtk.sanitizeHtml.afterSanitizeAttributes.registered');
type GlobalWithSentinel = typeof globalThis & { [HOOK_SENTINEL]?: true };
const globalScope = globalThis as GlobalWithSentinel;
if (!globalScope[HOOK_SENTINEL]) {
  globalScope[HOOK_SENTINEL] = true;
  DOMPurify.addHook('afterSanitizeAttributes', afterSanitizeAttributesHook);
}

const SANITIZE_CONFIG: Config = {
  ALLOWED_TAGS: [
    'a',
    'abbr',
    'b',
    'blockquote',
    'br',
    'caption',
    'cite',
    'code',
    'col',
    'colgroup',
    'dd',
    'div',
    'dl',
    'dt',
    'em',
    'figcaption',
    'figure',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'li',
    'mark',
    'ol',
    'p',
    'pre',
    's',
    'small',
    'span',
    'strong',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'u',
    'ul',
  ],
  ALLOWED_ATTR: [
    'href',
    'src',
    'alt',
    'title',
    'target',
    'rel',
    'width',
    'height',
    'class',
    'id',
    'colspan',
    'rowspan',
    // `data-assetref` is needed by AEM Universal Editor for asset round-trip;
    // `data-external` is set by our own hook below.
    'data-assetref',
    'data-external',
  ],
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
};

// Move whitespace from inside an inline tag opening to before it so authored
// content like "to<b> Plant a Tree</b>" doesn't render as "toPlant a Tree".
const liftLeadingInlineWhitespace = (html: string): string =>
  html.replace(/<(a|b|strong|em|i|u|span|mark)(\s[^>]*)?>(\s+)/gi, ' <$1$2>');

export const sanitizeRichTextHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  return DOMPurify.sanitize(liftLeadingInlineWhitespace(html), SANITIZE_CONFIG);
};

export const richTextDangerousHtml = (html: string | null | undefined): { __html: string } => ({
  __html: sanitizeRichTextHtml(html),
});
