import { NextResponse } from 'next/server';
import { IngestionRunner } from '@/lib/search/ingestion/ingestionRunner';
import { Locale, locales } from '@/lib/locale';
import { BadgeIndexer } from '@/lib/search/aws/indexer/badgeIndexer';
import { getFilterModel } from '@/lib/filters';
import { ActivityIndexer } from '../aws/indexer/activityIndexer';
import { AwardIndexer } from '../aws/indexer/awardIndexer';
import { clearAemCache } from '@/lib/api';
import { clearPdfCache } from '@/utils/pdfCache';
import { clearImageProxyCache } from '@/lib/imageProxyCache';
import { clearImageTransformCache } from '@/lib/imageTransformCache';

const TOO_MANY_REQUESTS = 429;

const runInBackground = async (tasks: (() => Promise<void>)[]) => {
  await tasks.reduce<Promise<void>>(async (promise, task) => {
    await promise;
    await task();
  }, Promise.resolve());
};

let isIndexing = false;

const setupIndexers = async () => {
  const indexers = locales.flatMap(async (locale: Locale) => {
    const filterModel = await getFilterModel(locale);
    const programLevels = filterModel.programLevels ?? [];
    const programLevelMap = new Map(programLevels.map(level => [level.name, level]));

    return [
      new ActivityIndexer(locale, programLevelMap),
      new AwardIndexer(locale, programLevelMap),
      new BadgeIndexer(locale, programLevelMap),
    ];
  });

  return await Promise.all(indexers).then(p => p.flat());
};

const tooManyRequestsResponse = () => {
  return NextResponse.json(
    {
      status: 'error',
      message: 'Reindexing is already in progress.',
    },
    { status: TOO_MANY_REQUESTS }
  );
};

/**
 * Reindexing runner for AWS OpenSearch.
 */
export default {
  run: async (force = false) => {
    if (isIndexing) {
      return tooManyRequestsResponse();
    }
    console.log(`Reindexing started${force ? ' (force — indexes will be dropped and recreated)' : ''}`);
    clearAemCache();
    clearPdfCache();
    clearImageProxyCache();
    clearImageTransformCache();
    const indexers = await setupIndexers();

    isIndexing = true;
    runInBackground(indexers.map(indexer => () => indexer.run(force))).finally(() => {
      isIndexing = false;
      console.log('Reindexing completed.');
    });
    console.log('Reindexing initialized.');

    return NextResponse.json({ status: 'ok', message: 'Reindexing started in the background.' });
  },
} as IngestionRunner;
