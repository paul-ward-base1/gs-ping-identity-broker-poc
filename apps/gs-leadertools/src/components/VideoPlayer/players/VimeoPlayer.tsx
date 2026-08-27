import { VideoPlatforms } from '@/types/contentModules';
import { IVideoPlayer, VideoPlayerConfig, VideoPlayerEvents, VimeoPlayerInstance } from '../types';
import { PLAYER_STATES, VIDEO_API_URLS } from '../constants';

export const createVimeoPlayer = (): IVideoPlayer => {
  let player: VimeoPlayerInstance | null = null;
  let isInitialized = false;
  let currentState: number = PLAYER_STATES.UNSTARTED;

  const loadVimeoAPI = async (): Promise<void> => {
    if (window.Vimeo) return;

    return new Promise(resolve => {
      const tag = document.createElement('script');
      tag.src = VIDEO_API_URLS[VideoPlatforms.Vimeo];
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      const checkVimeoAPI = setInterval(() => {
        if (window.Vimeo) {
          clearInterval(checkVimeoAPI);
          resolve();
        }
      }, 100);
    });
  };

  return {
    async initialize(config: VideoPlayerConfig, events: VideoPlayerEvents): Promise<void> {
      if (isInitialized) return;

      await loadVimeoAPI();

      if (!config.iframeRef.current) {
        throw new Error('Vimeo iframe reference not found');
      }

      player = new window.Vimeo.Player(config.iframeRef.current, {
        id: Number(config.videoId),
        controls: true,
      });

      await player.ready();
      isInitialized = true;
      currentState = PLAYER_STATES.LOADED;
      events.onReady();

      player.on('play', () => {
        currentState = PLAYER_STATES.PLAYING;
        events.onStateChange(PLAYER_STATES.PLAYING);
      });

      player.on('pause', () => {
        currentState = PLAYER_STATES.PAUSED;
        events.onStateChange(PLAYER_STATES.PAUSED);
      });

      player.on('ended', () => {
        currentState = PLAYER_STATES.ENDED;
        events.onStateChange(PLAYER_STATES.ENDED);
      });

      player.on('bufferstart', () => {
        currentState = PLAYER_STATES.BUFFERING;
        events.onStateChange(PLAYER_STATES.BUFFERING);
      });

      player.on('error', (error: Error) => {
        events.onError(error);
      });
    },

    async getCurrentTime(): Promise<number> {
      if (!player) throw new Error('Vimeo player not initialized');
      return player.getCurrentTime();
    },

    async getDuration(): Promise<number> {
      if (!player) throw new Error('Vimeo player not initialized');
      return player.getDuration();
    },

    getPlayerState(): number {
      return currentState;
    },

    play(): void {
      if (!player) throw new Error('Vimeo player not initialized');

      if (currentState === PLAYER_STATES.ENDED) {
        player.setCurrentTime(0);
      }
      player.play();
    },

    seekTo(time: number): void {
      if (!player) throw new Error('Vimeo player not initialized');
      player.setCurrentTime(time);
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
