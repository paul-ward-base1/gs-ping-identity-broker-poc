import React from 'react';

interface CircleShapeProps extends React.SVGProps<SVGSVGElement> {}

export const CircleShape: React.FC<CircleShapeProps> = props => {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g clipPath="url(#clip0_135_1341)">
        <path
          d="M100.011 200.022C155.246 200.022 200.022 155.246 200.022 100.011C200.022 44.7765 155.246 0 100.011 0C44.7765 0 0 44.7765 0 100.011C0 155.246 44.7765 200.022 100.011 200.022Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="clip0_135_1341">
          <rect width="200" height="200" fill="currentColor" />
        </clipPath>
      </defs>
    </svg>
  );
};
