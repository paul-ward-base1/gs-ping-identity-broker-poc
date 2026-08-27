import { cn } from '@/utils/classNames';
import { Card } from '@/components/Card';
import { CardProps } from '@/components/Card/types';
import { checkAllLevels } from '@/utils/programLevelUtils';
import './CardList.scss';
import { CardListProps } from './types';
import { CardPlaceholder } from '@/components/CardPlaceholder';

const bem = cn('card-list');

export const CardList = ({ items, loading, placeholderCount = 20 }: CardListProps) => {
  return (
    <div className={bem()}>
      {loading
        ? Array.from({ length: placeholderCount }, (_, index) => <CardPlaceholder key={index} />)
        : items?.map((item: CardProps, index: number) => {
            const programLevelIds = item.programLevels?.map(level => level.id);
            const hasAllLevels = checkAllLevels(programLevelIds);

            return <Card key={`${item.id}-${index}`} {...item} hasAllLevels={hasAllLevels} />;
          })}
    </div>
  );
};
