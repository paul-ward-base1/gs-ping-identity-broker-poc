import { Font } from '@react-pdf/renderer';

let registeredFor: string | null = null;

export const registerPdfFonts = (baseUrl?: string) => {
  const base = baseUrl ?? (typeof window !== 'undefined' ? window.location.origin : '');
  if (registeredFor === base) return;
  registeredFor = base;

  Font.register({
    family: 'Poppins',
    fonts: [
      { src: `${base}/fonts/Poppins-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/fonts/Poppins-Italic.ttf`, fontWeight: 400, fontStyle: 'italic' },
      { src: `${base}/fonts/Poppins-SemiBold.ttf`, fontWeight: 600 },
      { src: `${base}/fonts/Poppins-Bold.ttf`, fontWeight: 700 },
    ],
  });

  Font.registerHyphenationCallback(word => [word]);
};
