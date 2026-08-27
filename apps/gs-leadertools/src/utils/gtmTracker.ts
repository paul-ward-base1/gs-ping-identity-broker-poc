'use client';

import { useEffect, useRef } from 'react';
import { pushToDataLayer } from '@/lib/gtm';
import { ProgramLevelEnum } from '@/types/programLevel';

type GTMTrackerProps = {
  event: string;
  data: Record<string, unknown>;
};

export const useGTMTracker = ({ event, data }: GTMTrackerProps): void => {
  const lastEventPushed = useRef<string | null>(null);

  useEffect(() => {
    if (event && data) {
      if (lastEventPushed.current === event) return;
      lastEventPushed.current = event;
      pushToDataLayer({ event, ...data });
    }
  }, [event, data]);
};

type ErrorType = 'uncaught_error' | 'error_404' | 'server_error';

export const trackError = (errorMessage: string, errorType: ErrorType): void => {
  pushToDataLayer({
    event: 'page_error',
    error_type: errorType,
    error_message: errorMessage,
    page_location: window.location.href,
  });
};

export const clickTracker = (cta_type: string, destination_url?: string, file_name?: string) => {
  pushToDataLayer({
    event: 'cta_click',
    cta_type,
    link_url: window.location.href,
    destination_url,
    ...(file_name && { file_name }),
  });
};

type VideoEventType = 'video_start' | 'video_progress' | 'video_complete';

type VideoEventData = {
  videoTitle: string;
  videoDuration: number;
  videoUrl: string;
  videoPercent: number;
  videoProvider: string;
  videoCurrentTime: number;
};

export const videoTracker = (event: VideoEventType, data: VideoEventData) => {
  pushToDataLayer({
    event,
    video_title: data.videoTitle,
    video_duration: data.videoDuration,
    video_url: data.videoUrl,
    video_percent: data.videoPercent,
    video_provider: data.videoProvider.toLowerCase(),
    video_current_time: data.videoCurrentTime,
  });
};

type DownloadEventData = {
  fileName: string;
  fileType: string;
  linkText: string;
  linkUrl: string;
  imgUrl?: string;
};

export const downloadTracker = (data: DownloadEventData) => {
  pushToDataLayer({
    event: 'download_link',
    file_name: data.fileName,
    file_type: data.fileType,
    link_text: data.linkText,
    link_url: data.linkUrl,
    img_url: data.imgUrl,
  });
};

export type ScrollEventType = 'scroll_25' | 'scroll_50' | 'scroll_75' | 'scroll_90';
export type ScrollDirection = 'vertical' | 'horizontal';
export type ScrollThreshold = 25 | 50 | 75 | 90;
export type ScrollContentType = 'badge' | 'activity' | 'award';

export type ScrollEventData = {
  scrollDirection: ScrollDirection;
  scrollThreshold: ScrollThreshold;
  content_type: ScrollContentType;
  program_level: ProgramLevelEnum;
  theme: string;
};

export const scrollTracker = (event: ScrollEventType, data: ScrollEventData) => {
  pushToDataLayer({
    event,
    scrollDirection: data.scrollDirection,
    scrollThreshold: data.scrollThreshold,
    content_type: data.content_type,
    program_level: data.program_level,
    theme: data.theme,
  });
};
