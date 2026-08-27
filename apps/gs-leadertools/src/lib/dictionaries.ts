import { cache } from 'react';
import { fetchAEMDictionary } from '@/apis/dictionary';
import { Locale } from './locale';
import { debugLog } from './debug';
import { unflatten } from './unflatten';

export type LangProps = {
  params: Promise<{ lang: Locale }>;
};

export interface DictionaryFile {
  mimeType: string;
  url: string;
  width: number;
  height: number;
  path: string;
}

export enum DictionaryEntryType {
  Text = 'DictionaryTextEntryModel',
  Image = 'DictionaryImageEntryModel',
}

export type DictionaryTextEntry = {
  type: DictionaryEntryType.Text;
  key: string;
  value: string;
};

export type DictionaryImageEntry = {
  type: DictionaryEntryType.Image;
  key: string;
  label?: string;
  file: DictionaryFile;
};

type DictionaryEntry = DictionaryTextEntry | DictionaryImageEntry;

export interface DictionaryImageValue {
  label: string;
  file: DictionaryFile;
}

export type MixedDictionaryValue = string | DictionaryImageValue;

export type MixedDictionary = Record<string, MixedDictionaryValue>;

const buildCompleteDictionary = (entries: DictionaryEntry[]): MixedDictionary => {
  const result: Record<string, string | { label: string; file: DictionaryFile }> = {};

  for (const entry of entries) {
    if (entry.type === DictionaryEntryType.Text && entry.value) {
      result[entry.key] = entry.value;
    } else if (entry.type === DictionaryEntryType.Image && entry.label) {
      result[entry.key] = {
        label: entry.label,
        file: entry.file,
      };
    } else {
      result[entry.key] = ''; // fallback if needed
    }
  }

  return result;
};

const fetchDictionary = async (locale: Locale): Promise<MixedDictionary> => {
  try {
    const rawDictionaries = await fetchAEMDictionary(locale);

    const entries =
      rawDictionaries?.items
        ?.filter((item: { entries?: DictionaryEntry[] }) => Array.isArray(item.entries) && item.entries.length > 0)
        .flatMap((item: { entries?: DictionaryEntry[] }) => item.entries ?? []) ?? [];

    const flatDict = buildCompleteDictionary(entries);

    const nestedDict = unflatten(flatDict) as MixedDictionary;

    debugLog('dictionary', `Fetched ${entries.length} entries for locale: ${locale}`);
    return nestedDict;
  } catch (error) {
    console.error(`Failed to fetch dictionary for locale "${locale}"`, error);
    throw error;
  }
};

export const getDictionary = cache(fetchDictionary);

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
