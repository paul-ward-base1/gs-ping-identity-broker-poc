import { IVideoPlayer, VideoPlayerConfig, VideoPlayerEvents, YouTubePlayerInstance } from '@/components/VideoPlayer/types';
import { VideoPlatforms } from '@/types/contentModules';
import { PLAYER_STATES, VIDEO_API_URLS } from '../constants';

export const createYouTubePlayer = (): IVideoPlayer => {
  let player: YouTubePlayerInstance | null = null;
  let isInitialized = false;

  const loadYouTubeAPI = async (): Promise<void> => {
    if (window.YT?.Player) return;

    return new Promise(resolve => {
      const tag = document.createElement('script');
      tag.src = VIDEO_API_URLS[VideoPlatforms.Youtube];
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        resolve();
      };
    });
  };

  const ensurePlayerInitialized = (): void => {
    if (!player || !isInitialized) {
      throw new Error('YouTube player not initialized');
    }
  };

  return {
    async initialize(config: VideoPlayerConfig, events: VideoPlayerEvents): Promise<void> {
      if (isInitialized) return;

      await loadYouTubeAPI();

      if (!config.iframeRef.current) {
        throw new Error('YouTube iframe reference not found');
      }

      return new Promise((resolve, reject) => {
        try {
          player = new window.YT.Player(config.iframeRef.current, {
            events: {
              onReady: () => {
                isInitialized = true;
                events.onReady();
                resolve();
              },
              onStateChange: (event: { data: number }) => {
                events.onStateChange(event.data);
              },
              onError: (event: { data: number }) => {
                const error = new Error(`YouTube player error: ${event.data}`);
                events.onError(error);
                reject(error);
              },
            },
          });
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });
    },

    async getCurrentTime(): Promise<number> {
      ensurePlayerInitialized();
      if (!player) throw new Error('YouTube player not initialized');
      return player.getCurrentTime();
    },

    async getDuration(): Promise<number> {
      ensurePlayerInitialized();
      if (!player) throw new Error('YouTube player not initialized');
      return player.getDuration();
    },

    getPlayerState(): number {
      ensurePlayerInitialized();
      if (!player) throw new Error('YouTube player not initialized');
      return player.getPlayerState();
    },

    play(): void {
      ensurePlayerInitialized();
      if (!player) throw new Error('YouTube player not initialized');
      if (player.getPlayerState() === PLAYER_STATES.ENDED) {
        player.seekTo(0);
      }
      player.playVideo();
    },

    seekTo(time: number): void {
      ensurePlayerInitialized();
      if (!player) throw new Error('YouTube player not initialized');
      player.seekTo(time);
    },

    destroy(): void {
      if (player) {
        player.destroy();
        player = null;
        isInitialized = false;
      }
    },
  };
};
