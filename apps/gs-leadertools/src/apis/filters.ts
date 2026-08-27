import { getAemContextPath } from '@/lib/aemContext';
import { fetchAemData } from '@/lib/api';

/**
 * fetchFilters retrieves filter data from AEM based on the provided language.
 * It fetches badge families, program levels, and themes.
 *
 * @param lang - The language code for which to fetch the filters.
 * @return A promise that resolves to an object containing badge families, program levels, and themes.
 */
export const fetchFilters = async (lang: string) => {
  const contextPath = getAemContextPath(lang);
  const rawPath = `filters;contextPath=${contextPath}`;
  const encodedPath = encodeURIComponent(rawPath);

  const {
    data: {
      badgeFamilies: { items: badgeFamilies },
      programLevels: { items: programLevels },
      themes: { items: themes },
    },
  } = await fetchAemData(encodedPath);

  return { badgeFamilies, programLevels, themes };
};
