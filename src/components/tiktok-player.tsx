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
};

export function TikTokPlayer({ video, isActive, onInteraction }: TikTokPlayerProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [hasBeenActive, setHasBeenActive] = useState(isActive);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isActiveRef = useRef(isActive);
  const watchTimeStartRef = useRef<number | null>(null);
  const accumulatedWatchTimeRef = useRef(0);
  const videoDurationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && !hasBeenActive) {
      setHasBeenActive(true);
    }
  }, [hasBeenActive, isActive]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const sendPlayerCommand = (command: string, value?: number) => {
    if (!iframeRef.current?.contentWindow) return;

    iframeRef.current.contentWindow.postMessage(
      { 'x-tiktok-player-command': command, ...(value !== undefined ? { value } : {}) },
      '*'
    );
  };

  useEffect(() => {
    const handlePlayerMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data;
      if (!data || !data['x-tiktok-player']) return;

      switch (data.type) {
        case 'onReady':
          if (data.value && typeof data.value.duration === 'number') {
            videoDurationRef.current = data.value.duration * 1000;
          }

          setIsPlayerReady(true);

          if (!isActiveRef.current) {
            sendPlayerCommand('pause');
            sendPlayerCommand('mute');
            sendPlayerCommand('seek', 0);
          } else {
            sendPlayerCommand('unmute');
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
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, []);

  useEffect(() => {
    if (!isPlayerReady) return;

    if (isActive) {
      sendPlayerCommand('play');
      sendPlayerCommand('unmute');
    } else {
      sendPlayerCommand('pause');
      sendPlayerCommand('mute');
      sendPlayerCommand('seek', 0);
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

  if (!video.src || video.src.includes('tiktok.com')) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <div className="text-red-500">Invalid TikTok Video ID. Please update video data source.</div>
      </div>
    );
  }

  const iframeSrc = `https://www.tiktok.com/player/v1/${video.src}?loop=1&controls=1&autoplay=1&mute=1`;

  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="relative aspect-[9/16] h-full w-full max-w-[calc(100vh*9/16)]">
          {hasBeenActive && (
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="h-full w-full"
              allow="autoplay; encrypted-media;"
              onError={() => setError('Failed to load TikTok video.')}
            />
          )}
          <div className="absolute right-0 top-0 z-10 h-full w-16 bg-transparent" />
        </div>
      )}
    </div>
  );
}
