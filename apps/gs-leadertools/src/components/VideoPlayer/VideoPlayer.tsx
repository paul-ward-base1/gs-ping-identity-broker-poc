import { cn } from '@/utils/classNames';
import { PlayIcon } from '@/components/Icons';
import { VideoPlayerProps } from './types';
import { useVideoPlayer } from './useVideoPlayer';
import { PLAYER_PERMISSIONS } from './constants';

const bem = cn('activity-details-page');

export const VideoPlayer = ({ title, videoId, platform }: VideoPlayerProps) => {
  const { iframeRef, handlePlay, getVideoUrl, shouldShowOverlay } = useVideoPlayer({
    videoId,
    platform,
    title,
  });

  return (
    <div className={bem('video-container')}>
      <div className={bem('video-wrapper')}>
        <iframe
          ref={iframeRef}
          src={getVideoUrl()}
          title={title}
          allow={PLAYER_PERMISSIONS[platform]}
          allowFullScreen
        />
      </div>
      {shouldShowOverlay() && (
        <div className={bem('video-container-overlay')} onClick={handlePlay}>
          <PlayIcon className={bem('play-icon')} />
        </div>
      )}
    </div>
  );
};
