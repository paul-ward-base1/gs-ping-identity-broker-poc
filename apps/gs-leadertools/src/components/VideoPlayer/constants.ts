import { VideoPlatforms } from '@/types/contentModules';

export const VIDEO_API_URLS = {
  [VideoPlatforms.Youtube]: 'https://www.youtube.com/iframe_api',
  [VideoPlatforms.Vimeo]: 'https://player.vimeo.com/api/player.js',
} as const;

export const VIDEO_EMBED_URLS = {
  // origin param omitted: including it would require window.location.origin,
  // which is unavailable during SSR, producing a server/client URL mismatch
  // that React cannot patch on the iframe and that can silently break the
  // YouTube JS API.  The embed still works and enablejsapi still fires events
  // without it (postMessage targets * rather than a specific origin).
  [VideoPlatforms.Youtube]: (videoId: string) =>
    `https://www.youtube.com/embed/${videoId}?enablejsapi=1&controls=1&modestbranding=1&rel=0&showinfo=0`,
  [VideoPlatforms.Vimeo]: (videoId: string) =>
    `https://player.vimeo.com/video/${videoId}?api=1&controls=1&transparent=0&color=00B451`,
} as const;

export const PLAYER_STATES = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  LOADED: 4,
  CUED: 5,
} as const;

export const PLAYER_PERMISSIONS = {
  [VideoPlatforms.Youtube]: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
  [VideoPlatforms.Vimeo]: 'autoplay; fullscreen; picture-in-picture',
} as const;
