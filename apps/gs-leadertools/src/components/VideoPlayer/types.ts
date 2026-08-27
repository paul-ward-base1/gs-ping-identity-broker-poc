import type VimeoPlayer from '@vimeo/player';
import { VideoPlatforms } from '@/types/contentModules';

export interface VideoPlayerProps {
  title?: string;
  videoId?: string;
  platform: VideoPlatforms;
}

export interface VideoPlayerConfig {
  videoId: string;
  title: string;
  platform: VideoPlatforms;
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

/**
 * Vimeo player instance type — sourced from the official `@types/vimeo__player` package.
 * Provides event-typed `on()` overloads (e.g. `'error'` → `Vimeo.Error`, `'timeupdate'` → `Vimeo.TimeEvent`).
 */
export type VimeoPlayerInstance = VimeoPlayer;

export interface YouTubePlayerInstance {
  playVideo: () => void;
  seekTo: (seconds: number) => void;
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
}

export interface VideoPlayerEvents {
  onReady: () => void;
  onStateChange: (state: number) => Promise<void> | void;
  onError: (error: Error) => void;
}

export interface VideoPlayerMetrics {
  getCurrentTime: () => Promise<number>;
  getDuration: () => Promise<number>;
  getPlayerState?: () => number; // Optional because only YouTube uses this
}

export interface VideoPlayerControls {
  play: () => void;
  seekTo: (time: number) => void;
  destroy: () => void;
}

export interface IVideoPlayer extends VideoPlayerMetrics, VideoPlayerControls {
  initialize: (config: VideoPlayerConfig, events: VideoPlayerEvents) => Promise<void>;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (
        element: HTMLIFrameElement,
        options: {
          events: {
            onReady: () => void;
            onStateChange: (event: { data: number }) => void;
            onError?: (event: { data: number }) => void;
          };
        }
      ) => YouTubePlayerInstance;
    };
    Vimeo: {
      Player: typeof VimeoPlayer;
    };
  }
}
