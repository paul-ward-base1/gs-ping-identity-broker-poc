import React from 'react';

interface DiamondShapeProps extends React.SVGProps<SVGSVGElement> {}

export const DiamondShape: React.FC<DiamondShapeProps> = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="277" viewBox="0 0 200 277" fill="none" {...props}>
      <path
        d="M100 277C100.943 277 101.741 276.54 102.273 275.837C102.273 275.837 186.893 158.528 199.226 140.935C200.387 139.288 200.169 137.373 199.275 136.089C198.718 135.313 102.298 1.13892 102.298 1.13892C101.766 0.460415 100.943 0 100 0C99.057 0 98.2589 0.460415 97.7269 1.16315C97.7511 1.16315 1.30608 135.338 0.749853 136.113C-0.169131 137.397 -0.362601 139.312 0.798221 140.96C13.132 158.528 97.7511 275.861 97.7511 275.861C98.2589 276.564 99.0812 277.024 100.024 277.024L100 277Z"
        fill="currentColor"
      />
    </svg>
  );
};
