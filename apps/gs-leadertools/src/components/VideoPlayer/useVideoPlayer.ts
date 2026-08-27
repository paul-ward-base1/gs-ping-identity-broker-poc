import { useEffect, useRef, useState, useCallback } from 'react';
import { VideoPlatforms } from '@/types/contentModules';
import { videoTracker } from '@/utils/gtmTracker';
import { VideoPlayerProps, IVideoPlayer } from '@/components/VideoPlayer/types';
import { createYouTubePlayer, createVimeoPlayer } from './players';
import { VIDEO_EMBED_URLS, PLAYER_STATES } from './constants';

const PROGRESS_THRESHOLDS = [10, 25, 50, 75, 90];

export const useVideoPlayer = ({ videoId, platform, title = '' }: VideoPlayerProps) => {
  const [playerState, setPlayerState] = useState<number>(PLAYER_STATES.UNSTARTED);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<IVideoPlayer | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const reachedThresholds = useRef<Set<number>>(new Set());
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getVideoUrl = () => VIDEO_EMBED_URLS[platform](videoId ?? '');
  const videoUrl = getVideoUrl();

  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleProgressTracking = async (currentTime: number, videoDuration: number) => {
    if (!videoDuration || videoDuration <= 0) return;

    const currentPercent = Math.floor((currentTime / videoDuration) * 100);

    PROGRESS_THRESHOLDS.forEach(threshold => {
      if (currentPercent >= threshold && !reachedThresholds.current.has(threshold)) {
        reachedThresholds.current.add(threshold);
        videoTracker('video_progress', {
          videoTitle: title,
          videoDuration: videoDuration,
          videoUrl,
          videoPercent: threshold,
          videoProvider: platform,
          videoCurrentTime: currentTime,
        });
      }
    });
  };

  const startProgressTracking = () => {
    clearProgressInterval();

    progressIntervalRef.current = setInterval(async () => {
      if (!playerRef.current) {
        clearProgressInterval();
        return;
      }

      try {
        const currentTime = await playerRef.current.getCurrentTime();
        const videoDuration = await playerRef.current.getDuration();

        if (platform === VideoPlatforms.Youtube && playerRef.current.getPlayerState) {
          const state = playerRef.current.getPlayerState();
          if (state === PLAYER_STATES.PLAYING) {
            handleProgressTracking(currentTime, videoDuration);
          }
        } else {
          handleProgressTracking(currentTime, videoDuration);
        }
      } catch (error) {
        console.error('Error tracking video progress:', error);
        clearProgressInterval();
      }
    }, 1000);
  };

  const createVideoPlayer = (platform: VideoPlatforms) => {
    switch (platform) {
      case VideoPlatforms.Youtube:
        return createYouTubePlayer();
      case VideoPlatforms.Vimeo:
        return createVimeoPlayer();
      default:
        throw new Error(`Unsupported video platform: ${platform}`);
    }
  };

  const initializePlayer = useCallback(async () => {
    if (!videoId) return;

    try {
      const player = createVideoPlayer(platform);
      playerRef.current = player;

      await player.initialize(
        {
          videoId,
          platform,
          title,
          iframeRef: iframeRef as React.RefObject<HTMLIFrameElement>,
        },
        {
          onReady: () => {
            setIsPlayerReady(true);
          },
          onStateChange: async (state: number) => {
            setPlayerState(state);

            if (state === PLAYER_STATES.PLAYING) {
              const currentTime = await player.getCurrentTime();
              if (currentTime < 1) {
                const videoDuration = await player.getDuration();
                videoTracker('video_start', {
                  videoTitle: title,
                  videoDuration: videoDuration,
                  videoUrl,
                  videoPercent: 0,
                  videoProvider: platform,
                  videoCurrentTime: currentTime,
                });
              }
              startProgressTracking();
            } else if (state === PLAYER_STATES.PAUSED || state === PLAYER_STATES.ENDED) {
              clearProgressInterval();
            }

            if (state === PLAYER_STATES.ENDED) {
              const [currentTime, videoDuration] = await Promise.all([player.getCurrentTime(), player.getDuration()]);
              videoTracker('video_complete', {
                videoTitle: title,
                videoDuration: videoDuration,
                videoUrl,
                videoPercent: 100,
                videoProvider: platform,
                videoCurrentTime: currentTime,
              });
            }
          },
          onError: (error: Error) => {
            console.error('Video player error:', error);
          },
        }
      );
    } catch (error) {
      console.error('Error initializing video player:', error);
    }
  }, [videoId, platform, title, videoUrl, startProgressTracking, clearProgressInterval]);

  useEffect(() => {
    if (!videoId || !iframeRef.current) return;

    initializePlayer();

    return () => {
      clearProgressInterval();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      setIsPlayerReady(false);
      reachedThresholds.current.clear();
    };
  }, [videoId, platform]);

  const handlePlay = () => {
    if (!playerRef.current || !isPlayerReady) return;
    playerRef.current.play();
  };

  const shouldShowOverlay = () => {
    if (platform === VideoPlatforms.Youtube) {
      return playerState === PLAYER_STATES.UNSTARTED;
    }
    return playerState === PLAYER_STATES.UNSTARTED || playerState === PLAYER_STATES.LOADED;
  };

  return {
    iframeRef,
    handlePlay,
    getVideoUrl,
    shouldShowOverlay,
  };
};
