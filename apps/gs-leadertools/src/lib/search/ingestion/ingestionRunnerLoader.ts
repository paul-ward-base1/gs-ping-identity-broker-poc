import { createDynamicModuleLoader } from '@/lib/dynamicModuleLoader';
import { searchType } from '@/lib/search/searchType';
import { IngestionRunner } from '@/lib/search/ingestion/ingestionRunner';

/**
 * createDynamicModuleLoader creates a dynamic module loader for the IngestionRunner.
 * See {@link searchType} for more info.
 */
export const loadIngestionRunner = createDynamicModuleLoader<IngestionRunner>(
  () => `search/ingestion/${searchType}Runner`);
