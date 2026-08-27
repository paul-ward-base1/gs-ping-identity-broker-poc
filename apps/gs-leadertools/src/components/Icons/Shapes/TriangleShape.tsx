import React from 'react';

interface TriangleShapeProps extends React.SVGProps<SVGSVGElement> {}

export const TriangleShape: React.FC<TriangleShapeProps> = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="174" viewBox="0 0 200 174" fill="none" {...props}>
      <path
        d="M0.312261 170.458L97.9617 1.18083C98.8637 -0.381891 101.136 -0.381891 102.038 1.18083L199.688 170.458C200.59 172.021 199.462 173.983 197.658 173.983H2.35927C0.555126 173.983 -0.589812 172.021 0.329608 170.458H0.312261Z"
        fill="currentColor"
      />
    </svg>
  );
};
