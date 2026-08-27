import { SVGProps } from '@/components/svgs/types';

export const JuniorIcon = ({ fill = '#5C1F8B', className }: SVGProps) => {
  return (
    <svg className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.99933 12.0013C2.68526 12.0013 -0.00133514 9.31474 -0.00133514 6.00067C-0.00133514 2.68659 2.68526 0 5.99933 0C9.31341 0 12 2.68659 12 6.00067C12 9.31474 9.31341 12.0013 5.99933 12.0013Z"
        fill={fill}
      />
    </svg>
  );
};
