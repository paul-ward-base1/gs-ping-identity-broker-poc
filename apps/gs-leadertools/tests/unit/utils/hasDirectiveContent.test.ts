import { describe, it, expect } from 'vitest';
import { hasDirectiveContent } from '@/utils/hasDirectiveContent';
import { BadgeModel } from '@/types/badge';

// Sample badge details returned by AEM once VTKN-537 (BE "Directive Content" tab) is live.
const badgeWithDirective: BadgeModel = {
  path: '/content/dam/gsusa-vtk-redesign/en/badges/daisy/very-deep-dive/very-deep-dive',
  badgeName: 'Very Deep Dive',
  badgeId: 'Daisy-VeryDeepDive-2026',
  directiveTitle: 'Directive Title very deep dive',
  directiveDescription: { html: '<p>Dir desc <i>very</i> deep dive</p>\n' },
};

describe('hasDirectiveContent', () => {
  it('returns true for the AEM sample with title and rich text description', () => {
    expect(hasDirectiveContent(badgeWithDirective)).toBe(true);
  });

  it('returns true when only directiveTitle is present', () => {
    expect(hasDirectiveContent({ directiveTitle: 'Title only' })).toBe(true);
  });

  it('returns true when only directiveDescription.html is present', () => {
    expect(hasDirectiveContent({ directiveDescription: { html: '<p>Body only</p>' } })).toBe(true);
  });

  it('returns false when directiveDescription has no html', () => {
    expect(hasDirectiveContent({ directiveDescription: {} })).toBe(false);
  });

  it('returns false for a badge with neither field (VTKN-537 not yet applied)', () => {
    expect(hasDirectiveContent({ badgeName: 'Mark My Route' } as BadgeModel)).toBe(false);
  });

  it('returns false when directiveTitle is an empty string and description is absent', () => {
    expect(hasDirectiveContent({ directiveTitle: '' })).toBe(false);
  });

  it('returns false when directiveDescription.html is an empty string', () => {
    expect(hasDirectiveContent({ directiveDescription: { html: '' } })).toBe(false);
  });
});
