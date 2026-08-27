import React from 'react';

interface PlayIconProps extends React.SVGProps<SVGSVGElement> {}

export const PlayIcon: React.FC<PlayIconProps> = props => {
  return (
    <svg width="80" height="81" viewBox="0 0 80 81" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40.8682" r="40" fill="white" />
      <path
        d="M52.9168 39.1029L34.1769 27.3569C32.8449 26.522 31.1147 27.4795 31.1147 29.0515V52.5435C31.1147 54.1155 32.8449 55.073 34.1769 54.2381L52.9168 42.4921C54.1672 41.7084 54.1672 39.8866 52.9168 39.1029Z"
        fill="#005640"
      />
    </svg>
  );
};
