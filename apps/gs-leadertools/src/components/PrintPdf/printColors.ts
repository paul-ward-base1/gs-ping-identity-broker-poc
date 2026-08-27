import { ProgramLevelIds } from '@/types/programLevel';

/** Brand secondary green used for step / numbered bubbles (color mode). */
export const BRAND_SECONDARY = '#006b50';

/** Brand tertiary purple used for the closing-question / file / callout icons (color mode). */
export const BRAND_TERTIARY = '#5c1f8b';

export interface PdfLevelColor {
  bg: string;
  text: string;
}

interface PdfLevelTheme extends PdfLevelColor {
  tint: string;
  icon: string;
  shape: string;
}

// Per-level print theme mirrored from `_level-colors.scss` (bg/text, tint,
// shape) and `Callout.scss` (icon).
const LEVEL_THEME: Record<string, PdfLevelTheme> = {
  [ProgramLevelIds.DAISY]: { bg: '#1597d4', text: '#ffffff', tint: '#f5fcfe', icon: '#1597d4', shape: '#d9f2f9' },
  [ProgramLevelIds.BROWNIE]: { bg: '#753b16', text: '#ffffff', tint: '#fbfaf5', icon: '#753b16', shape: '#eeead9' },
  [ProgramLevelIds.JUNIOR]: { bg: '#5c1f8b', text: '#ffffff', tint: '#faf7fe', icon: '#5c1f8b', shape: '#f0e8fd' },
  [ProgramLevelIds.CADETTE]: { bg: '#e22f22', text: '#ffffff', tint: '#fef7fb', icon: '#e22f22', shape: '#fcddef' },
  [ProgramLevelIds.SENIOR]: { bg: '#fe8209', text: '#212529', tint: '#fff8f5', icon: '#fe8209', shape: '#fee3d8' },
  [ProgramLevelIds.AMBASSADOR]: { bg: '#f9bf03', text: '#212529', tint: '#fffeec', icon: '#f9bf03', shape: '#fffbb3' },
  [ProgramLevelIds.ALL]: { bg: '#006b50', text: '#ffffff', tint: '#f5f5f5', icon: '#006b50', shape: '#ffffff' },
  [ProgramLevelIds.MULTI]: { bg: '#f5f5f5', text: '#212529', tint: '#f5f5f5', icon: BRAND_TERTIARY, shape: '#ffffff' },
};

const FALLBACK_THEME: PdfLevelTheme = {
  bg: BRAND_TERTIARY,
  text: '#ffffff',
  tint: '#f5f5f5',
  icon: BRAND_TERTIARY,
  shape: '#ffffff',
};

const themeFor = (id?: string): PdfLevelTheme => LEVEL_THEME[id ?? ''] ?? FALLBACK_THEME;

export const getPdfLevelColor = (id?: string): PdfLevelColor => {
  const { bg, text } = themeFor(id);
  return { bg, text };
};

export const getPdfLevelTint = (id?: string): string => themeFor(id).tint;

export const getPdfIconColor = (id?: string): string => themeFor(id).icon;

export const getPdfShapeColor = (id?: string): string => themeFor(id).shape;
