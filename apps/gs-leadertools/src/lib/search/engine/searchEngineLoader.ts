import { searchType } from '@/lib/search/searchType';
import { SearchEngine } from '@/lib/search/engine/searchEngine';

const loadEngine = async (): Promise<SearchEngine> => {
  switch (searchType) {
    case 'awsOpenSearch': {
      const { default: engine } = await import('@/lib/search/engine/awsOpenSearchEngine');
      return engine;
    }
    case 'aem': {
      const { default: engine } = await import('@/lib/search/engine/aemEngine');
      return engine;
    }
    case 'mock':
    default: {
      const { default: engine } = await import('@/lib/search/engine/mockEngine');
      return engine;
    }
  }
};

export const loadSearchEngine = { load: loadEngine };
