export const AEM_MODULE = 'gsusa-vtk-redesign';

export const GRAPHQL_PATH = `graphql/execute.json/${AEM_MODULE}/`;
export const getAemContextPath = (lang: string) => `/content/dam/${AEM_MODULE}/${lang}`;

export const buildAemBadgePath = (lang: string, level: string, badge: string, id?: string) => {
  const aemContextPath = getAemContextPath(lang);

  return id ? `${aemContextPath}/badges/${level}/${badge}/${id}` : `${aemContextPath}/badges/${level}/${badge}`;
};

export const buildCmsActivityPath = (lang: string, type: string, slug: string, group?: string): string => {
  const base = `${getAemContextPath(lang)}/activities/${type}`;
  return group ? `${base}/${group}/${slug}/${slug}` : `${base}/${slug}/${slug}`;
};

export const normalizeBadgePath = (path?: string): string => {
  if (!path) return '/';

  const parts = path.split('/').filter(Boolean); // remove empty parts

  const badgeIndex = parts.indexOf('badges');

  if (badgeIndex === -1 || badgeIndex + 2 >= parts.length) {
    throw new Error('Invalid badge path structure');
  }

  const level = parts[badgeIndex + 1];
  const badge = parts[badgeIndex + 2];

  return `badge/${level}/${badge}`;
};

/** AEM DAM path for an award (slug is doubled, optional `level` folder). */
export const buildAemAwardPath = (lang: string, slug: string, level?: string): string => {
  const base = `${getAemContextPath(lang)}/awards`;
  return level ? `${base}/${level}/${slug}/${slug}` : `${base}/${slug}/${slug}`;
};

/** AEM award DAM path → client route. Accepts `/awards/{slug}/{slug}` and `/awards/{level}/{slug}/{slug}`. */
export const normalizeAwardPath = (path?: string): string => {
  if (!path) return '/';

  const cmsRoot = `/content/dam/${AEM_MODULE}/`;
  const regex = new RegExp(`^${cmsRoot}([a-z]{2})/awards/([^/]+)(?:/([^/]+))?/[^/]+$`);
  const match = regex.exec(path);

  if (!match) {
    throw new Error('Invalid award path structure');
  }

  const [, locale, levelOrSlug, maybeSlug] = match;

  if (maybeSlug) {
    return `/${locale}/award/${levelOrSlug}/${maybeSlug}`;
  }
  return `/${locale}/award/${levelOrSlug}`;
};

export const normalizeActivityPath = (path?: string): string => {
  if (!path) return '/';

  const cmsRoot = `/content/dam/${AEM_MODULE}/`;
  const regex = new RegExp(`^${cmsRoot}([a-z]{2})/activities/([^/]+)/([^/]+)(?:/([^/]+))?/[^/]+$`);
  const match = regex.exec(path);

  if (!match) {
    throw new Error('Invalid CMS activity path format');
  }

  const [, locale, type, groupOrSlug, slug] = match;

  if (slug) {
    // 2-level slug
    return `/${locale}/activity/${type}/${groupOrSlug}/${slug}`;
  } else {
    // 1-level slug
    return `/${locale}/activity/${type}/${groupOrSlug}`;
  }
};

/** Non-throwing wrapper around normalizeActivityPath: returns undefined on a
 *  malformed path so callers in render/PDF-build paths can't crash. */
export const safeNormalizeActivityPath = (path?: string): string | undefined => {
  try {
    return normalizeActivityPath(path);
  } catch {
    return undefined;
  }
};
