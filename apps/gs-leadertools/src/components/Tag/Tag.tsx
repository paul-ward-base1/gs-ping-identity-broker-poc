import React, { useMemo } from 'react';
import { cn } from '@/utils/classNames';
import { TagProps } from './types';
import { tagIconMapping } from './constants';
import './Tag.scss';

const bem = cn('tag');

export const Tag = ({ id, level, type }: TagProps) => {
  const IconEl = useMemo(() => {
    if (type === 'content' && !!id) return tagIconMapping[id];

    return React.Fragment;
  }, [type, id]);

  return (
    <div className={bem({ type, level: id })}>
      <IconEl />
      {level}
    </div>
  );
};
