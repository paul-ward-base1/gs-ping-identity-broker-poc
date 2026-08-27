import { IndexableDocument } from '@/lib/search/aws/indexer/source/document';
import { ProgramLevel } from '@/lib/search/aws/indexer/source/programLevel';

export interface AwardDocument extends IndexableDocument {
  id: string;
  image: string;
  family?: string;
  keywords?: string[];
  path: string;
  programLevels?: ProgramLevel[];
  theme?: string;
}
