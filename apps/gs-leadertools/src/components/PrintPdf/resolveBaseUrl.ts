export const resolveBaseUrl = (explicit?: string): string => {
  if (explicit) return explicit;
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
};
