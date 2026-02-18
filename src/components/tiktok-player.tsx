
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
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const visibilityTimer = useRef<NodeJS.Timeout | null>(null);
  const viewStartTime = useRef<number | null>(null);

  useEffect(() => {
    const fetchOembed = async () => {
      try {
        const response = await fetch(`https://www.tiktok.com/oembed?url=${video.src}`);
        const data = await response.json();
        if (response.ok) {
          const cleanedHtml = data.html.replace(/style=".*?"/, '');
          setEmbedHtml(cleanedHtml);
        } else {
          setError(data.message || 'Failed to load TikTok video.');
        }
      } catch (error) {
        console.error("Failed to fetch TikTok oEmbed:", error);
        setError('Failed to load TikTok video.');
      }
    };

    if (video.src.includes('tiktok')) {
      fetchOembed();
    }
  }, [video.src]);

  useEffect(() => {
    if (embedHtml) {
      // Ensure the script is loaded only once
      if (!document.querySelector('script[src="https://www.tiktok.com/embed.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [embedHtml]);

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
      className="h-full w-full flex justify-center items-center bg-white"
    >
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : embedHtml ? (
        <div className="tiktok-embed" dangerouslySetInnerHTML={{ __html: embedHtml }} />
      ) : (
        <div className="text-black">Loading TikTok...</div>
      )}
    </div>
  );
}
