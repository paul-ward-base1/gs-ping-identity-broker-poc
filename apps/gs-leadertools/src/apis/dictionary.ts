import { fetchAemData } from '@/lib/api';
import { getAemContextPath } from '@/lib/aemContext';

export async function fetchAEMDictionary(lang: string) {
  const contextPath = getAemContextPath(lang);
  const rawPath = `dictionaries;contextPath=${contextPath}`;
  const encodedPath = encodeURIComponent(rawPath);

  const {
    data: { dictionaries },
  } = await fetchAemData(encodedPath);

  return dictionaries;
}
