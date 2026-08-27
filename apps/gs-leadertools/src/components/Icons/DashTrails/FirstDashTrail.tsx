import React from 'react';

interface FirstDashTrailProps extends React.SVGProps<SVGSVGElement> {}

export const FirstDashTrail: React.FC<FirstDashTrailProps> = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="137" height="211" viewBox="0 0 137 211" fill="none" {...props}>
      <path
        d="M135.732 4.60359C83.4674 -4.36938 -35.1412 5.66277 -91.4582 117.575C-147.775 229.488 -237.121 214.894 -274.754 193.607"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="10 10"
      />
    </svg>
  );
};
