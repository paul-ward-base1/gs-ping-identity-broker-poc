export const getFileNameFromUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  const base = url.split('?')[0].split('#')[0].split('/').pop();
  if (!base) return undefined;
  try {
    return decodeURIComponent(base);
  } catch {
    return base;
  }
};
