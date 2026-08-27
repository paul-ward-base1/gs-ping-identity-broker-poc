import { ProgramLevelIds } from '@/types/programLevel';

export interface TagProps {
  level: string;
  id: ProgramLevelIds;
  type?: 'filled' | 'content';
}
