
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

  const [isPlayerReady, setIsPlayerReady] = useState(false);

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
            setIsPlayerReady(true);
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
    if (player && isPlayerReady) {
      if (isActive) {
        // A short delay can help ensure the player is responsive to commands after becoming ready.
        setTimeout(() => {
          player.postMessage({ 'x-tiktok-player-command': 'play' }, '*');
        }, 50);
      } else {
        player.postMessage({ 'x-tiktok-player-command': 'pause' }, '*');
      }
    }
  }, [isActive, isPlayerReady]);

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
        <div className="relative w-full h-full max-w-[calc(100vh*9/16)] aspect-[9/16]">
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            className="w-full h-full"
            allow="autoplay; encrypted-media;"
            onError={() => setError('Failed to load TikTok video.')}
          ></iframe>
          {/* This overlay covers the right-side buttons (like, comment, share) */}
          <div className="absolute top-0 right-0 h-full w-16 bg-transparent z-10"></div>
        </div>
      )}
    </div>
  );
}
