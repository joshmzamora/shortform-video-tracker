
"use client";

import { useState, useEffect, useRef } from 'react';
import type { Video } from '@/lib/videos';
import type { VideoInteraction } from './video-player';

type TikTokPlayerProps = {
  video: Video;
  isActive: boolean;
  onInteraction: (interaction: Omit<VideoInteraction, 'interactionType'>) => void;
};

export function TikTokPlayer({ video, isActive, onInteraction }: TikTokPlayerProps) {
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const watchTimeStartRef = useRef<number | null>(null);
  const accumulatedWatchTimeRef = useRef(0);
  const videoDurationRef = useRef<number | null>(null);

  // Effect to handle messaging from the TikTok iframe
  useEffect(() => {
    const handlePlayerMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) {
        return;
      }

      const data = event.data;
      if (data && data['x-tiktok-player']) {
        switch (data.type) {
          case 'onReady':
            if (data.value && typeof data.value.duration === 'number') {
              videoDurationRef.current = data.value.duration * 1000; // convert to ms
            }
            break;
          case 'onStateChange':
            const state = data.value;
            if (state === 1) { // Playing
              watchTimeStartRef.current = Date.now();
            } else if (watchTimeStartRef.current && (state === 2 || state === 0)) { // Paused or Ended
              const elapsed = Date.now() - watchTimeStartRef.current;
              accumulatedWatchTimeRef.current += elapsed;
              watchTimeStartRef.current = null;
            }
            break;
        }
      }
    };

    window.addEventListener('message', handlePlayerMessage);

    return () => {
      window.removeEventListener('message', handlePlayerMessage);
    };
  }, []);

  // Effect to report watch time when the component becomes inactive
  useEffect(() => {
    if (!isActive) {
      let finalWatchTime = accumulatedWatchTimeRef.current;
      if (watchTimeStartRef.current) {
        finalWatchTime += Date.now() - watchTimeStartRef.current;
      }

      if (finalWatchTime > 0) {
        onInteraction({ 
          videoId: video.id, 
          watchTimeMs: finalWatchTime, 
          videoDurationMs: videoDurationRef.current ?? undefined 
        });
      }

      // Reset for next time
      accumulatedWatchTimeRef.current = 0;
      watchTimeStartRef.current = null;
    }
  }, [isActive, onInteraction, video.id]);

  // Effect to control playback
  useEffect(() => {
    const player = iframeRef.current?.contentWindow;
    if (player) {
      if (isActive) {
        // Use a small delay to ensure the player is ready for commands
        setTimeout(() => {
          player.postMessage({ 'x-tiktok-player-command': 'play' }, '*');
        }, 100); // 100ms delay
      } else {
        player.postMessage({ 'x-tiktok-player-command': 'pause' }, '*');
      }
    }
  }, [isActive]);

  if (!video.src || video.src.includes('tiktok.com')) {
    // This component now expects a video ID, not a full URL.
    // If we receive a full URL, it's from the old getVideos logic.
    // We can show an error or try to extract the ID, but for now, we'll show an error.
    return (
      <div className="h-full w-full flex justify-center items-center bg-black">
        <div className="text-red-500">Invalid TikTok Video ID. Please update video data source.</div>
      </div>
    );
  }

  const iframeSrc = `https://www.tiktok.com/player/v1/${video.src}?loop=0&controls=1`;

  return (
    <div className="h-full w-full flex justify-center items-center bg-black">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="w-full h-full max-w-[calc(100vh*9/16)] aspect-[9/16]"
          allow="autoplay; encrypted-media;"
          onError={() => setError('Failed to load TikTok video.')}
        ></iframe>
      )}
    </div>
  );
}
