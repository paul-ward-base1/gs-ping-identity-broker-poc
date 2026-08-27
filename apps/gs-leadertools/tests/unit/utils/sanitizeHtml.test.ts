import { describe, it, expect, vi } from 'vitest';

const AEM_BASE = 'https://aem.example.com';
const AEM_DAM_PATH = 'content/dam/gsusa-vtk-redesign';

vi.mock('@/lib/aemBase', () => ({
  getAemBase: () => AEM_BASE,
}));

// `buildImagePath` reads AEM_DAM_PATH at call time (via getAemDamPath, which
// falls through to process.env.AEM_DAM_PATH server-side); stub it before
// importing the sanitizer so img rewrites resolve to the proxy URL.
vi.stubEnv('AEM_DAM_PATH', AEM_DAM_PATH);

import { sanitizeRichTextHtml } from '@/utils/sanitizeHtml';

describe('sanitizeRichTextHtml', () => {
  describe('empty / falsy input', () => {
    it.each([
      ['', ''],
      [null, ''],
      [undefined, ''],
    ])('returns "" for %p', (input, expected) => {
      expect(sanitizeRichTextHtml(input as string | null | undefined)).toBe(expected);
    });
  });

  describe('script / event handler removal', () => {
    it('strips <script>', () => {
      const out = sanitizeRichTextHtml('<script>alert(1)</script><p>ok</p>');
      expect(out).not.toMatch(/<script/i);
      expect(out).toContain('<p>ok</p>');
    });

    it('strips inline onerror', () => {
      const out = sanitizeRichTextHtml('<img src="x" onerror="alert(1)">');
      expect(out).not.toMatch(/onerror/i);
    });

    it('strips <svg onload>', () => {
      const out = sanitizeRichTextHtml('<svg onload=alert(1)>');
      expect(out).not.toMatch(/<svg/i);
      expect(out).not.toMatch(/onload/i);
    });

    it('strips <iframe>', () => {
      const out = sanitizeRichTextHtml('<iframe src="https://evil.example"></iframe>');
      expect(out).not.toMatch(/<iframe/i);
    });

    it('strips <object> and <embed>', () => {
      expect(sanitizeRichTextHtml('<object data="x"></object>')).not.toMatch(/<object/i);
      expect(sanitizeRichTextHtml('<embed src="x">')).not.toMatch(/<embed/i);
    });

    it('strips <meta http-equiv="refresh">', () => {
      const out = sanitizeRichTextHtml('<meta http-equiv="refresh" content="0;url=//evil">');
      expect(out).not.toMatch(/<meta/i);
    });

    it('strips inline style attributes', () => {
      const out = sanitizeRichTextHtml('<p style="background:url(javascript:alert(1))">x</p>');
      expect(out).toContain('<p>x</p>');
      expect(out).not.toMatch(/style=/i);
      expect(out).not.toMatch(/javascript:/i);
    });

    it('strips style with expression()', () => {
      const out = sanitizeRichTextHtml('<p style="width:expression(alert(1))">x</p>');
      expect(out).not.toMatch(/style=/i);
      expect(out).not.toMatch(/expression/i);
    });

    it('neutralizes mutation XSS via comment', () => {
      const out = sanitizeRichTextHtml('<!--<img src=x onerror=alert(1)//-->');
      expect(out).not.toMatch(/onerror/i);
      expect(out).not.toMatch(/alert\(1\)/);
    });
  });

  describe('dangerous href schemes', () => {
    it('removes javascript: href', () => {
      const out = sanitizeRichTextHtml('<a href="javascript:alert(1)">x</a>');
      expect(out).not.toMatch(/href=/i);
      expect(out).not.toMatch(/javascript:/i);
    });

    it('removes data: href', () => {
      const out = sanitizeRichTextHtml('<a href="data:text/html,<script>alert(1)</script>">x</a>');
      expect(out).not.toMatch(/href=/i);
    });

    it('removes vbscript: href', () => {
      const out = sanitizeRichTextHtml('<a href="vbscript:msgbox(1)">x</a>');
      expect(out).not.toMatch(/href=/i);
    });

    it('removes javascript: hidden via HTML entity', () => {
      const out = sanitizeRichTextHtml('<a href="java&#115;cript:alert(1)">x</a>');
      expect(out).not.toMatch(/javascript/i);
      expect(out).not.toMatch(/href=/i);
    });

    it('removes javascript: with leading whitespace / case bypass', () => {
      const out = sanitizeRichTextHtml('<a href=" JaVaScRiPt:alert(1)">x</a>');
      expect(out).not.toMatch(/javascript/i);
      expect(out).not.toMatch(/href=/i);
    });

    it('does not tag bare www. href as external (no scheme)', () => {
      const out = sanitizeRichTextHtml('<a href="www.example.com">x</a>');
      // No scheme -> our hook does not tag external; no target=_blank / no
      // data-external should appear. The href value itself is preserved so a
      // future change that silently strips it would be visible here.
      expect(out).toContain('href="www.example.com"');
      expect(out).not.toMatch(/data-external/i);
      expect(out).not.toMatch(/target="_blank"/);
    });

    it('strips javascript: via HTML entity in <img src>', () => {
      const out = sanitizeRichTextHtml('<img src="java&#115;cript:alert(1)">');
      expect(out).not.toMatch(/javascript/i);
      expect(out).not.toMatch(/src=/i);
    });

    it('strips <script> nested inside <svg>', () => {
      const out = sanitizeRichTextHtml('<svg><script>alert(1)</script></svg>');
      expect(out).not.toMatch(/<svg/i);
      expect(out).not.toMatch(/<script/i);
      expect(out).not.toMatch(/alert\(1\)/);
    });
  });

  describe('AEM-relative URL rewriting', () => {
    it('rewrites relative /content image src to the local /img proxy', () => {
      // `/content/dam/<dam-path>/common/media/x.png` -> `/img/common/media/x.png`
      const out = sanitizeRichTextHtml(`<img src="/${AEM_DAM_PATH}/common/media/x.png">`);
      expect(out).toContain('src="/img/common/media/x.png"');
    });

    it('does not leak the AEM origin in image src', () => {
      const out = sanitizeRichTextHtml('<img src="/content/dam/foo/bar.png">');
      expect(out).not.toContain(AEM_BASE);
      expect(out).toMatch(/src="\/img\//);
    });

    it('rewrites relative /content anchor href to absolute AEM origin', () => {
      // Anchors (asset downloads) bypass the image proxy and go to AEM directly.
      const out = sanitizeRichTextHtml('<a href="/content/something">x</a>');
      expect(out).toContain(`href="${AEM_BASE}/content/something"`);
    });
  });

  describe('external links', () => {
    it('tags absolute http(s) anchors as external', () => {
      const out = sanitizeRichTextHtml('<a href="https://example.com">x</a>');
      expect(out).toMatch(/target="_blank"/);
      expect(out).toMatch(/rel="noopener noreferrer"/);
      expect(out).toMatch(/data-external="true"/);
    });

    it('is idempotent on re-sanitize', () => {
      const once = sanitizeRichTextHtml('<a href="https://example.com">x</a>');
      const twice = sanitizeRichTextHtml(once);
      expect(twice).toBe(once);
    });

    it('keeps data-external on image-only external anchor', () => {
      const out = sanitizeRichTextHtml('<a href="https://example.com"><img src="/content/dam/x.png"></a>');
      expect(out).toMatch(/data-external="true"/);
      expect(out).toMatch(/target="_blank"/);
      expect(out).toMatch(/rel="noopener noreferrer"/);
    });

    it('keeps data-external on mixed image + text anchor (icon not suppressed)', () => {
      // CSS suppresses the external-link icon only when <img> is the only
      // child. Mixed anchors should remain tagged as external so the icon
      // renders as usual.
      const out = sanitizeRichTextHtml('<a href="https://example.com"><img src="/content/dam/x.png">caption</a>');
      expect(out).toMatch(/data-external="true"/);
      expect(out).toMatch(/target="_blank"/);
      expect(out).toMatch(/rel="noopener noreferrer"/);
      // Children survive (img + trailing text).
      expect(out).toMatch(/<img/);
      expect(out).toContain('caption');
    });
  });

  describe('AEM authoring attributes', () => {
    it('preserves data-assetref on <img> for Universal Editor round-trip', () => {
      const out = sanitizeRichTextHtml('<img src="/content/dam/x.png" data-assetref="x-123">');
      expect(out).toMatch(/data-assetref="x-123"/);
    });
  });

  describe('image attribute hygiene', () => {
    it('defaults missing alt to empty string', () => {
      const out = sanitizeRichTextHtml('<img src="/content/dam/x.png">');
      expect(out).toMatch(/alt=""/);
    });
  });

  describe('whitelist preserves formatting tags', () => {
    it('keeps headings, lists, and basic inline tags', () => {
      const html = '<h1>T</h1><h2>S</h2><p><strong>bold</strong> <em>i</em></p><ul><li>a</li></ul><ol><li>b</li></ol>';
      const out = sanitizeRichTextHtml(html);
      expect(out).toContain('<h1>T</h1>');
      expect(out).toContain('<h2>S</h2>');
      expect(out).toContain('<strong>bold</strong>');
      expect(out).toContain('<em>i</em>');
      expect(out).toContain('<ul>');
      expect(out).toContain('<ol>');
    });
  });
});
