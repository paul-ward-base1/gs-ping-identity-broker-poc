import React, { type FC, type ReactNode } from 'react';
import Html from 'react-pdf-html';
import { Image, Text, View } from '@react-pdf/renderer';
import { htmlStylesheet, colors } from '../styles';
import { buildImagePath } from '@/utils/buildImagePath';
import { printImageSrc } from '@/utils/printImageSrc';
import { resolveBaseUrl } from '../resolveBaseUrl';

interface PdfHtmlProps {
  html?: string;
  stylesheet?: Record<string, object>;
  baseUrl?: string;
  /** Render embedded images in full color instead of grayscale. */
  color?: boolean;
}

// react-pdf-html doesn't re-export its renderer prop types; we mirror the
// subset of node-html-parser's HTMLElement shape we actually touch.
interface RendererElement {
  tag: string;
  attributes: Record<string, string | undefined>;
  closest?: (selector: string) => RendererElement | null;
  previousElementSibling?: RendererElement | null;
}

interface RendererProps {
  element: RendererElement;
  children?: ReactNode;
}

type Renderer = FC<RendererProps>;

const toAbsoluteImageSrc = (src: string, baseUrl: string): string => {
  if (!src) return src;
  if (/^(?:https?:|data:)/i.test(src)) return src;
  if (src.startsWith('/')) {
    if (!baseUrl) {
      throw new Error('PdfHtml needs a baseUrl prop (or a browser context) to resolve relative image URLs');
    }
    return `${baseUrl}${src}`;
  }
  return src;
};

const rewriteAemImageToProxy = (src: string): string => {
  if (src.startsWith('/content/dam/') || src.startsWith('/content/')) {
    return buildImagePath(src);
  }
  return src;
};

const buildImgTransform =
  (baseUrl: string, color: boolean) =>
  (src: string): string =>
    toAbsoluteImageSrc(printImageSrc(rewriteAemImageToProxy(src), color), baseUrl);

const rewriteImgSrcs = (html: string, transform: (src: string) => string) =>
  html
    .replace(/(<img\b[^>]*?\bsrc\s*=\s*")([^"]+)(")/gi, (_, pre, src, post) => `${pre}${transform(src)}${post}`)
    .replace(/(<img\b[^>]*?\bsrc\s*=\s*')([^']+)(')/gi, (_, pre, src, post) => `${pre}${transform(src)}${post}`);

// AEM authors insert `<p>&nbsp;</p>` between blocks for a visual gap on the
// web. The PDF paragraph margin already provides that spacing.
const stripEmptyParagraphs = (html: string): string => html.replace(/<p\b[^>]*>(\s|&nbsp;|&#160;)*<\/p>/gi, '');

const sanitize = (html: string, baseUrl: string, color: boolean) =>
  rewriteImgSrcs(
    stripEmptyParagraphs(
      html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/<br\s*\/?>/gi, '<br/>')
        .trim()
    ),
    buildImgTransform(baseUrl, color)
  );

// react-pdf-html's default <img> renderer passes an ACAO request header that
// some proxies reject, so the image fetch fails silently. Render <Image>
// ourselves with the simple `src` prop.
const imgRenderer: Renderer = ({ element }) => {
  const src = element.attributes?.src;
  if (!src) return null;
  return (
    <View style={{ alignItems: 'center', marginVertical: 6 }}>
      <Image src={src} style={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain' }} />
    </View>
  );
};

// react-pdf's <Link> primitive prepends hard-coded `{ color: 'blue',
// textDecoration: 'underline' }` styles that leak through htmlStylesheet
// overrides. Render <a> as plain <Text> so it inherits paragraph styles.
const aRenderer: Renderer = ({ children }) => <Text>{children}</Text>;

// Default react-pdf-html <li> renderer stacks the marker above the content
// (column flex) and inherits italic from any wrapping <em>. We render a row
// with the marker in upright Poppins; wrap=false keeps marker and content
// on the same page.
const liRenderer: Renderer = ({ element, children }) => {
  const list = element.closest?.('ol, ul');
  const ordered = list?.tag === 'ol';
  let index = 0;
  if (ordered) {
    let sib = element.previousElementSibling;
    while (sib) {
      if (sib.tag === 'li') index += 1;
      sib = sib.previousElementSibling ?? null;
    }
  }
  const marker = ordered ? `${index + 1}.` : '•';
  const markerWidth = ordered ? 16 : 12;
  return (
    <View wrap={false} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3 }}>
      <Text
        style={{
          width: markerWidth,
          paddingRight: 4,
          fontStyle: 'normal',
          fontWeight: 'normal',
          color: colors.neutral70,
          fontSize: 9,
          lineHeight: 1.45,
          textAlign: ordered ? 'right' : 'left',
        }}
      >
        {marker}
      </Text>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};

const renderers = {
  li: liRenderer,
  img: imgRenderer,
  a: aRenderer,
};

export const PdfHtml = ({ html, stylesheet, baseUrl: explicitBaseUrl, color = false }: PdfHtmlProps) => {
  const baseUrl = resolveBaseUrl(explicitBaseUrl);
  if (!html) return null;
  const clean = sanitize(html, baseUrl, color);
  if (!clean) return null;

  return (
    <Html
      stylesheet={{ ...htmlStylesheet, ...(stylesheet ?? {}) }}
      // react-pdf-html doesn't publicly export its renderers prop type, so
      // we route through ComponentProps to recover it without a deep import.
      renderers={renderers as React.ComponentProps<typeof Html>['renderers']}
      resetStyles
      style={{ fontSize: 9 }}
    >
      {`<div>${clean}</div>`}
    </Html>
  );
};
