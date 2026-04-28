"use client";

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TikTokPlayer, type TikTokInteraction } from '@/components/tiktok-player';
import { type Video } from '@/lib/videos';
import { getVideos, saveInteraction } from './actions';
import { useSession } from '@/lib/session-context';
import { Loader2, PartyPopper, ServerCrash, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const PRELOAD_VIDEO_COUNT = 2;
const PREMOUNT_VIDEO_COUNT = 2;

function extractTikTokVideoId(src: string) {
  const match = src.match(/\/video\/(\d+)/);
  return match?.[1] ?? src.trim();
}

export type SessionData = {
  videoId: string;
  watchTimeMs: number;
  videoDurationMs?: number;
  interactionType: 'view';
  participantId: string;
  genre: string;
  timestamp: string;
};

type SessionState = 'initializing' | 'running' | 'completed' | 'error';

function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { participantId: contextParticipantId, addSessionEvent, clearSession } = useSession();
  const { toast } = useToast();

  const [sessionState, setSessionState] = useState<SessionState>('initializing');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoList, setVideoList] = useState<Video[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [unavailableVideoIds, setUnavailableVideoIds] = useState<string[]>([]);

  const participantId = contextParticipantId || searchParams.get('participantId');

  useEffect(() => {
    const initSession = async () => {
      if (!participantId) {
        router.replace('/start');
        return;
      }

      try {
        const result = await getVideos();
        if (result.success && result.videos && result.videos.length > 0) {
          setVideoList(result.videos);
          setSessionState('running');
          setSessionId(`${participantId}_${Date.now()}`);
        } else {
          toast({
            variant: "destructive",
            title: "Configuration Error",
            description: result.message || "No videos found in public/videos folder.",
          });
          setSessionState('error');
        }
      } catch (error) {
        console.error("Failed to load videos:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load videos.",
        });
        setSessionState('error');
      }
    };

    initSession();
  }, [participantId, router, toast]);

  useEffect(() => {
    if (videoList.length === 0 || typeof document === 'undefined') return;

    const head = document.head;
    const links: HTMLLinkElement[] = [];

    const registerLink = (rel: string, href: string, as?: string) => {
      if (head.querySelector(`link[rel="${rel}"][href="${href}"]`)) return;

      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      if (as) {
        link.as = as;
      }
      head.appendChild(link);
      links.push(link);
    };

    registerLink('dns-prefetch', 'https://www.tiktok.com');
    registerLink('preconnect', 'https://www.tiktok.com');
    registerLink('preconnect', 'https://sf16-website.neutral.ttwstatic.com');

    videoList.slice(0, PRELOAD_VIDEO_COUNT).forEach((video) => {
      const videoId = extractTikTokVideoId(video.src);
      if (!videoId) return;
      registerLink('prefetch', `https://www.tiktok.com/player/v1/${videoId}?loop=1&controls=1&autoplay=1&mute=1`, 'document');
    });

    return () => {
      links.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [videoList]);

  const handleInteraction = useCallback((interaction: TikTokInteraction) => {
    const video = videoList.find((entry) => entry.id === interaction.videoId);
    if (!video || !participantId || !sessionId) return;

    const newRecord: SessionData = {
      ...interaction,
      interactionType: 'view',
      participantId,
      genre: video.genre,
      timestamp: new Date().toISOString(),
    };

    addSessionEvent(newRecord);
    saveInteraction(sessionId, newRecord).catch((err) => console.error("Failed to transmit interaction:", err));
  }, [addSessionEvent, participantId, sessionId, videoList]);

  const handleNextVideo = () => {
    if (currentVideoIndex < videoList.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setSessionState('completed');
    }
  };

  const handlePrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const advanceToNextAvailable = useCallback((startIndex: number) => {
    for (let index = startIndex + 1; index < videoList.length; index += 1) {
      if (!unavailableVideoIds.includes(videoList[index].id)) {
        setCurrentVideoIndex(index);
        return true;
      }
    }

    setSessionState('completed');
    return false;
  }, [unavailableVideoIds, videoList]);

  const handleVideoUnavailable = useCallback((videoId: string) => {
    setUnavailableVideoIds((previous) => {
      if (previous.includes(videoId)) return previous;
      return [...previous, videoId];
    });

    const unavailableIndex = videoList.findIndex((video) => video.id === videoId);
    if (unavailableIndex === -1) return;

    toast({
      title: "Video unavailable",
      description: "That TikTok could not be loaded, so it was skipped.",
      variant: "destructive",
    });

    if (unavailableIndex === currentVideoIndex) {
      advanceToNextAvailable(unavailableIndex);
    }
  }, [advanceToNextAvailable, currentVideoIndex, toast, videoList]);

  if (sessionState === 'initializing') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (sessionState === 'error') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <ServerCrash className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">An Error Occurred</h1>
          <p className="mt-2 text-muted-foreground">Could not load the video session. Please try again later.</p>
          <Button onClick={() => router.push('/')} className="mt-6">Go Home</Button>
        </div>
      </div>
    );
  }

  if (sessionState === 'completed') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="text-center">
          <PartyPopper className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-2xl font-bold">Session Complete!</h1>
          <p className="mt-2 text-muted-foreground">Thank you for your participation.</p>
          <Button onClick={() => { clearSession(); router.push('/'); }} className="mt-6">Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <div
        className="h-full w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(-${currentVideoIndex * 100}vh)` }}
      >
        {videoList.map((video, index) => (
          <div key={video.id} className="flex h-screen w-screen items-center justify-center">
            <TikTokPlayer
              video={video}
              isActive={index === currentVideoIndex}
              onInteraction={handleInteraction}
              shouldMount={index <= currentVideoIndex + PREMOUNT_VIDEO_COUNT}
              onUnavailable={handleVideoUnavailable}
            />
          </div>
        ))}
      </div>

      <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col space-y-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handlePrevVideo}
          disabled={currentVideoIndex === 0}
          className="h-12 w-12 rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-transform duration-200 hover:scale-110 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronUp className="h-7 w-7" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleNextVideo}
          disabled={currentVideoIndex >= videoList.length - 1}
          className="h-12 w-12 rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-transform duration-200 hover:scale-110 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronDown className="h-7 w-7" />
        </Button>
      </div>
    </div>
  );
}

export default function SessionPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SessionPage />
    </Suspense>
  );
}
