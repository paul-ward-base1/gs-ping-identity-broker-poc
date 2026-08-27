import React from 'react';

interface SecondDashTrailProps extends React.SVGProps<SVGSVGElement> {}

export const SecondDashTrail: React.FC<SecondDashTrailProps> = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="167" height="98" viewBox="0 0 167 98" fill="none" {...props}>
      <path
        d="M444.024 96.2861C407.583 57.7614 306.655 -5.34346 194.473 50.4348C82.2914 106.213 19.549 40.9517 2.20054 1.34882"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="10 10"
      />
    </svg>
  );
};
