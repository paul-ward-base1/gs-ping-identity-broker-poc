import React from 'react';

interface RectangleShapeProps extends React.SVGProps<SVGSVGElement> {}

export const RectangleShape: React.FC<RectangleShapeProps> = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="290" viewBox="0 0 200 290" fill="none" {...props}>
      <path
        d="M192.569 0H7.4311C3.32701 0 0 3.32323 0 7.42264V282.577C0 286.677 3.32701 290 7.4311 290H192.569C196.673 290 200 286.677 200 282.577V7.42264C200 3.32323 196.673 0 192.569 0Z"
        fill="currentColor"
      />
    </svg>
  );
};
