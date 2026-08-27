/** Returns the defined `url`s from a list of handout-like items, in order. */
export const getDownloadableUrls = (items: { url?: string }[]): string[] =>
  items.map(item => item.url).filter((url): url is string => !!url);
