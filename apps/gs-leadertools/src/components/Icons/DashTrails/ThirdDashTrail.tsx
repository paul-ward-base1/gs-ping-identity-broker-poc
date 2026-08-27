import React from 'react';

interface ThirdDashTrailProps extends React.SVGProps<SVGSVGElement> {}

export const ThirdDashTrail: React.FC<ThirdDashTrailProps> = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="413" height="115" viewBox="0 0 413 115" fill="none" {...props}>
      <path
        d="M2.35545 194.622C28.9667 148.753 112.689 64.141 234.688 92.6427C356.686 121.144 402.75 43.2099 410.531 0.679861"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="10 10"
      />
    </svg>
  );
};
