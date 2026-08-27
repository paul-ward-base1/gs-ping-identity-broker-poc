import { SVGProps } from '@/components/svgs/types';

export const BulletIcon = ({ fill = '#00B451', className }: SVGProps) => {
  return (
    <svg className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="10" r="5" fill={fill} />
    </svg>
  );
};
