"use client";

import { useEffect, useRef, useState } from 'react';
import type { Video } from '@/lib/videos';

export type TikTokInteraction = {
  videoId: string;
  watchTimeMs: number;
  videoDurationMs?: number;
};

type TikTokPlayerProps = {
  video: Video;
  isActive: boolean;
  onInteraction: (interaction: TikTokInteraction) => void;
  shouldMount?: boolean;
  onUnavailable?: (videoId: string, reason: string) => void;
};

function extractTikTokVideoId(src: string) {
  const match = src.match(/\/video\/(\d+)/);
  return match?.[1] ?? src.trim();
}

export function TikTokPlayer({ video, isActive, onInteraction, shouldMount = false, onUnavailable }: TikTokPlayerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [shouldRenderIframe, setShouldRenderIframe] = useState(isActive || shouldMount);
  const reportedUnavailableRef = useRef(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isActiveRef = useRef(isActive);
  const watchTimeStartRef = useRef<number | null>(null);
  const accumulatedWatchTimeRef = useRef(0);
  const videoDurationRef = useRef<number | null>(null);
  const readyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoId = extractTikTokVideoId(video.src);

  useEffect(() => {
    if (isActive || shouldMount) {
      setShouldRenderIframe(true);
    }
  }, [isActive, shouldMount]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    setError(null);
    setIsPlayerReady(false);
    reportedUnavailableRef.current = false;
  }, [video.id, video.src]);

  const reportUnavailable = (reason: string) => {
    if (reportedUnavailableRef.current) return;
    reportedUnavailableRef.current = true;
    setError('This TikTok video is unavailable.');
    onUnavailable?.(video.id, reason);
  };

  const sendPlayerCommand = (command: 'play' | 'pause' | 'mute' | 'unMute' | 'seekTo', value?: number) => {
    if (!iframeRef.current?.contentWindow) return;

    iframeRef.current.contentWindow.postMessage(
      { type: command, value, 'x-tiktok-player': true },
      '*'
    );
  };

  useEffect(() => {
    const handlePlayerMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data;
      if (!data || !data['x-tiktok-player']) return;

      switch (data.type) {
        case 'onPlayerReady':
        case 'onReady':
          if (data.value && typeof data.value.duration === 'number') {
            videoDurationRef.current = data.value.duration * 1000;
          }

          if (readyTimeoutRef.current) {
            clearTimeout(readyTimeoutRef.current);
            readyTimeoutRef.current = null;
          }
          setIsPlayerReady(true);

          if (!isActiveRef.current) {
            sendPlayerCommand('pause');
            sendPlayerCommand('mute');
            sendPlayerCommand('seekTo', 0);
          } else {
            sendPlayerCommand('seekTo', 0);
            sendPlayerCommand('unMute');
            sendPlayerCommand('play');
          }
          break;
        case 'onStateChange':
          if (!isActiveRef.current) return;

          if (data.value === 1) {
            watchTimeStartRef.current = Date.now();
          } else if (watchTimeStartRef.current && (data.value === 2 || data.value === 0)) {
            const elapsed = Date.now() - watchTimeStartRef.current;
            accumulatedWatchTimeRef.current += elapsed;
            watchTimeStartRef.current = null;
          }
          break;
        case 'onPlayerError': {
          const errorType = data.value?.errorType;
          const errorCode = data.value?.errorCode;
          reportUnavailable(`${errorType ?? 'PLAYER_ERROR'}:${errorCode ?? 'unknown'}`);
          break;
        }
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, []);

  useEffect(() => {
    if (!shouldRenderIframe || isPlayerReady || error) return;

    readyTimeoutRef.current = setTimeout(() => {
      reportUnavailable('PLAYER_READY_TIMEOUT');
    }, 7000);

    return () => {
      if (readyTimeoutRef.current) {
        clearTimeout(readyTimeoutRef.current);
        readyTimeoutRef.current = null;
      }
    };
  }, [error, isPlayerReady, shouldRenderIframe]);

  useEffect(() => {
    if (!isPlayerReady) return;

    if (isActive) {
      sendPlayerCommand('seekTo', 0);
      sendPlayerCommand('play');
      sendPlayerCommand('unMute');
    } else {
      sendPlayerCommand('pause');
      sendPlayerCommand('mute');
      sendPlayerCommand('seekTo', 0);
    }
  }, [isActive, isPlayerReady]);

  useEffect(() => {
    if (isActive) return;

    let finalWatchTime = accumulatedWatchTimeRef.current;
    if (watchTimeStartRef.current) {
      finalWatchTime += Date.now() - watchTimeStartRef.current;
    }

    if (finalWatchTime > 0) {
      onInteraction({
        videoId: video.id,
        watchTimeMs: finalWatchTime,
        videoDurationMs: videoDurationRef.current ?? undefined,
      });
    }

    accumulatedWatchTimeRef.current = 0;
    watchTimeStartRef.current = null;
  }, [isActive, onInteraction, video.id]);

  useEffect(() => {
    return () => {
      if (accumulatedWatchTimeRef.current <= 0 && !watchTimeStartRef.current) return;

      let finalWatchTime = accumulatedWatchTimeRef.current;
      if (watchTimeStartRef.current) {
        finalWatchTime += Date.now() - watchTimeStartRef.current;
      }

      if (finalWatchTime > 0) {
        onInteraction({
          videoId: video.id,
          watchTimeMs: finalWatchTime,
          videoDurationMs: videoDurationRef.current ?? undefined,
        });
      }
    };
  }, [onInteraction, video.id]);

  if (!videoId) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div className="text-red-500">Invalid TikTok Video ID. Please update video data source.</div>
      </div>
    );
  }

  const iframeSrc = `https://www.tiktok.com/player/v1/${videoId}?loop=1&controls=1&autoplay=1&muted=0`;

  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="relative aspect-[9/16] h-full w-full max-w-[calc(100vh*9/16)]">
          {!isPlayerReady && !error && shouldRenderIframe && (
            <div className="absolute inset-0 flex items-center justify-center bg-black text-sm text-white/70">
              Loading video...
            </div>
          )}
          {shouldRenderIframe && (
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="h-full w-full"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              onError={() => reportUnavailable('IFRAME_LOAD_ERROR')}
            />
          )}
          <div
            className="absolute inset-0 z-10 bg-transparent"
            onClick={(event) => event.preventDefault()}
            onMouseDown={(event) => event.preventDefault()}
            onPointerDown={(event) => event.preventDefault()}
            onTouchStart={(event) => event.preventDefault()}
          />
        </div>
      )}
    </div>
  );
}
