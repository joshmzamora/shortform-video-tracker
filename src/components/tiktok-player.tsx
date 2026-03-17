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
  const isActiveRef = useRef(isActive);

  // NEW: Track if this specific slide has ever been active
  const [hasBeenActive, setHasBeenActive] = useState(isActive);

  // Mark the slide as active the first time it comes into view
  useEffect(() => {
    if (isActive && !hasBeenActive) {
      setHasBeenActive(true);
    }
  }, [isActive, hasBeenActive]);

  // Keep the ref updated with the latest isActive value
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Helper to post commands to the TikTok player
  const sendPlayerCommand = (command: string, value?: number) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { 'x-tiktok-player-command': command, ...(value !== undefined && { value }) },
        '*'
      );
    }
  };

  // Set up the TikTok player message listener once
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
              videoDurationRef.current = data.value.duration * 1000;
            }
            setIsPlayerReady(true);
            
            // Edge case: If the user swiped away extremely fast while this iframe was still loading
            if (!isActiveRef.current) {
              sendPlayerCommand('pause');
              sendPlayerCommand('mute');
              sendPlayerCommand('seek', 0);
            } else {
              sendPlayerCommand('unmute');
            }
            break;

          case 'onStateChange':
            if (isActiveRef.current) {
              const state = data.value;
              if (state === 1) { // Playing
                watchTimeStartRef.current = Date.now();
              } else if (watchTimeStartRef.current && (state === 2 || state === 0)) { // Paused or Ended
                const elapsed = Date.now() - watchTimeStartRef.current;
                accumulatedWatchTimeRef.current += elapsed;
                watchTimeStartRef.current = null;
              }
            }
            break;
        }
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => {
      window.removeEventListener('message', handlePlayerMessage);
    };
  }, []); // Empty deps – runs once

  // Effect to respond to isActive changes after the player is mounted and ready
  useEffect(() => {
    if (isPlayerReady) {
      if (isActive) {
        sendPlayerCommand('play');
        sendPlayerCommand('unmute');
      } else {
        sendPlayerCommand('pause');
        sendPlayerCommand('mute');
        sendPlayerCommand('seek', 0);
      }
    }
  }, [isActive, isPlayerReady]);

  // Report watch time when the component becomes inactive
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
          videoDurationMs: videoDurationRef.current ?? undefined,
        });
      }

      accumulatedWatchTimeRef.current = 0;
      watchTimeStartRef.current = null;
    }
  }, [isActive, onInteraction, video.id]);

  // Report remaining watch time on unmount
  useEffect(() => {
    return () => {
      if (accumulatedWatchTimeRef.current > 0 || watchTimeStartRef.current) {
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
      }
    };
  }, [onInteraction, video.id]);

  if (!video.src || video.src.includes('tiktok.com')) {
    return (
      <div className="h-full w-full flex justify-center items-center bg-black">
        <div className="text-red-500">Invalid TikTok Video ID. Please update video data source.</div>
      </div>
    );
  }

  // We are back to hardcoding autoplay=1, because the iframe won't exist until it's the active slide
  const iframeSrc = `https://www.tiktok.com/player/v1/${video.src}?loop=1&controls=1&autoplay=1&mute=1`;

  return (
    <div className="h-full w-full flex justify-center items-center bg-black">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="relative w-full h-full max-w-[calc(100vh*9/16)] aspect-[9/16]">
          {/* Only mount the iframe if it is currently active, or has been active in the past */}
          {hasBeenActive && (
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="w-full h-full"
              allow="autoplay; encrypted-media;"
              onError={() => setError('Failed to load TikTok video.')}
            ></iframe>
          )}
          <div className="absolute top-0 right-0 h-full w-16 bg-transparent z-10"></div>
        </div>
      )}
    </div>
  );
}