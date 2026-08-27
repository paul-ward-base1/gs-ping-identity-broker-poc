import { SideRailBoxIconType } from '@/components/SideRailBox/types';

const icon: SideRailBoxIconType = 'shield';

export const defaultSideRailBoxProps = {
  title: 'Safety checkpoint',
  icon,
  volunteers: 2,
  girlScouts: 25,
  description:
    'Volunteers should be unrelated, and at least one of whom should be female for up to 25 Girl Scout Juniors (Grades 4-5).',
  items: ['Internet Safety Pledge'],
};
