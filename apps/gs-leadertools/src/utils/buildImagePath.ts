import { getAemDamPath } from '@/lib/aemDamPath';

export const buildImagePath = (path: string | undefined) => {
  if (!path) return '';
  if (path.startsWith('.storybook/')) return path;

  const damPath = getAemDamPath();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const prefix = damPath ? `${damPath}/` : '';
  const stripped = prefix && cleanPath.startsWith(prefix) ? cleanPath.slice(prefix.length) : cleanPath;
  return `/img/${stripped}`;
};
