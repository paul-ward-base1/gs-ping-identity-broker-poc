/** Resolves a handout URL to a downloadable href: relative URLs pass through;
 *  absolute URLs go through the same-origin /api/download proxy. */
export const resolveDownloadUrl = (url?: string): string | undefined =>
  url ? (url.startsWith('/') ? url : `/api/download?url=${encodeURIComponent(url)}`) : undefined;
