export const isExternalLink = (href: string | null, hostname: string): boolean => {
  if (!href) return false;

  const isExternal = href?.startsWith('http://') || href?.startsWith('https://') || href?.startsWith('www.');

  return isExternal && !href?.includes(hostname);
};
