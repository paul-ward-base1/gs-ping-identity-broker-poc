import { Locale } from '@/lib/locale';
import { KEYWORD_PATTERN, TextField } from '@/lib/search/aws/indexer/source/common';
import { ProgramLevelFilter } from '@/types/filter';
import { ProgramLevel } from '@/lib/search/aws/indexer/source/programLevel';

interface NamedItem {
  name?: string;
}

interface PlainTextField {
  plaintext?: string;
}

export abstract class DataLoader<T> {

  protected constructor(
    private readonly programLevelFilters: Map<string, ProgramLevelFilter>) {
  }

  public abstract loadData(lang: Locale): Promise<T[]>;

  protected extractNames(source: NamedItem[] = []): string[] | undefined {
    const items = source
      .map((item) => item?.name)
      .filter((name): name is string => !!name);

    return items.length ? items : undefined;
  }

  protected extractNamesFrom<K extends string>(
    propertyName: K,
    source: Array<{ [P in K]?: NamedItem }> = [],
  ): string[] | undefined {
    const items = source
      .map((item) => item?.[propertyName]?.name)
      .filter((name): name is string => !!name);

    return items.length ? items : undefined;
  }

  protected extractKeyword(tagId: string): string | null {
    const match = KEYWORD_PATTERN.exec(tagId);

    return match ? match[1] : null;
  };

  protected extractPlainTextFrom(source: PlainTextField): string {
    return source.plaintext ?? '';
  };

  protected findProgramLevelByName(name: string | undefined): ProgramLevel | undefined {
    const programLevel = name ? this.programLevelFilters.get(name) : null;

    return programLevel ? {
      name: programLevel.name,
      order: programLevel.order,
    } : undefined;
  };

  protected validateNonEmpty(fieldNames: string[], subject: object): boolean {
    const record = subject as Record<string, unknown>;
    return fieldNames.every(field => {
      const value = record[field];
      const type = typeof value;

      return type === 'object' && value
        || type === 'string' && (value as string).trim().length > 0;
    });
  };

  protected hasNonEmptyPlainText(text: PlainTextField | undefined): boolean {
    return !!text && this.validateNonEmpty([TextField.PLAIN_TEXT], text);
  };

}
