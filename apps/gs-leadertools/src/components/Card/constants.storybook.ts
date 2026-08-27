import { CardProps } from './types';
import { ProgramLevelEnum } from '../../types/programLevel';

export const defaultBadgeCardProps: CardProps = {
  title: 'Helping animals on your community',
  theme: 'Hiking, Camping, and Outdoor Adventures',
  time: '30 - 40 minutes',
  id: 'cardId',
  cardImage:
    'https://uat.girlscouts.org/content/dam/gsusa-vtk-redesign/en/badges/daisy/animal-observer/media/AnimalObserver.png',
  programLevels: [ProgramLevelEnum.JUNIOR, ProgramLevelEnum.DAISY, ProgramLevelEnum.BROWNIE],
  type: 'badge',
};

export const activityBadgeCardProps: CardProps = {
  title: 'Role-play 911',
  theme: 'Balanced Living',
  time: '30 - 40 minutes',
  id: 'role-play-911',
  cardImage:
    'https://uat.girlscouts.org/content/dam/gsusa-vtk-redesign/common/media/images/placeholders/Balanced%20Living_Activity%20Icon.png',
  programLevels: [ProgramLevelEnum.BROWNIE],
  type: 'activity',
};
