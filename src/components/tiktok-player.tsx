
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
  const ref = useRef<HTMLDivElement>(null);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const viewStartTime = useRef<number | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef || !isActive) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          viewStartTime.current = Date.now();
        } else if (viewStartTime.current) {
          const watchTimeMs = Date.now() - viewStartTime.current;
          onInteraction({ videoId: video.id, watchTimeMs });
          viewStartTime.current = null;
        }
      });
    };

    intersectionObserver.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, // 50% of the element is visible
    });

    intersectionObserver.current.observe(currentRef);

    return () => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }
      if (viewStartTime.current) {
        const watchTimeMs = Date.now() - viewStartTime.current;
        onInteraction({ videoId: video.id, watchTimeMs });
        viewStartTime.current = null;
      }
    };
  }, [isActive, onInteraction, video.id]);

  return (
    <div
      ref={ref}
      className="h-full w-full flex justify-center items-center bg-black"
    >
      <div className="relative w-full h-full max-w-[calc(100vh*9/16)] aspect-[9/16] bg-black">
        <iframe
          src={`https://www.tiktok.com/embed/v3/${video.src.split('/').pop()}`}
          className="absolute top-0 left-0 w-full h-full border-0"
          allowFullScreen
          title="TikTok video"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-scripts allow-top-navigation allow-same-origin"
        />
      </div>
    </div>
  );
}
