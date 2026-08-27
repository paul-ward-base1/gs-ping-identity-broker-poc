import { SVGProps } from '@/components/svgs/types';

export const BrownieIcon = ({ fill = '#753B16', className }: SVGProps) => {
  return (
    <svg className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.9811 11.0028L6.1221 0.855536C6.06798 0.761859 5.93163 0.761859 5.8775 0.855536L0.0185404 11.0028C-0.0355844 11.0965 0.0320711 11.2141 0.14032 11.2141H11.8582C11.9665 11.2141 12.0352 11.0965 11.98 11.0028H11.9811Z"
        fill={fill}
      />
    </svg>
  );
};
