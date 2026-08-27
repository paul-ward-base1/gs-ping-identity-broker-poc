import { SVGProps } from '@/components/svgs/types';

export const SeniorIcon = ({ fill = '#FE8209', className }: SVGProps) => {
  return (
    <svg className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.297244 0H7.70276C7.86692 0 8 0.137513 8 0.307144V11.6929C8 11.8625 7.86692 12 7.70276 12H0.297244C0.13308 12 0 11.8625 0 11.6929V0.307144C0 0.137513 0.13308 0 0.297244 0Z"
        fill={fill}
      />
    </svg>
  );
};
