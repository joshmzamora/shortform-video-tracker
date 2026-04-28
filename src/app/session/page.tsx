"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TikTokPlayer, type TikTokInteraction } from '@/components/tiktok-player';
import { SessionTimer } from '@/components/session-timer';
import { type Video } from '@/lib/videos';
import { getVideos, saveInteraction } from './actions';
import { useSession } from '@/lib/session-context';
import { Loader2, PartyPopper, ServerCrash, ChevronUp, ChevronDown, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const SESSION_DURATION_SECONDS = 600;
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

type SessionState = 'initializing' | 'running' | 'completed' | 'invalidated' | 'error';

function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { participantId: contextParticipantId, addSessionEvent, clearSession, sessionEvents } = useSession();
  const { toast } = useToast();

  const [sessionState, setSessionState] = useState<SessionState>('initializing');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoList, setVideoList] = useState<Video[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [unavailableVideoIds, setUnavailableVideoIds] = useState<string[]>([]);
  const [invalidationReason, setInvalidationReason] = useState('');
  const [showResults, setShowResults] = useState(false);
  const invalidationHandledRef = useRef(false);
  const completionHandledRef = useRef(false);

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
      completeSession();
    }
  };

  const handlePrevVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const invalidateSession = useCallback((reason: string) => {
    if (invalidationHandledRef.current) return;
    invalidationHandledRef.current = true;
    setInvalidationReason(reason);
    clearSession();
    setSessionState('invalidated');
  }, [clearSession]);

  const completeSession = useCallback(() => {
    if (completionHandledRef.current || invalidationHandledRef.current) return;
    completionHandledRef.current = true;
    setShowResults(false);
    setSessionState('completed');
  }, []);

  const advanceToNextAvailable = useCallback((startIndex: number) => {
    for (let index = startIndex + 1; index < videoList.length; index += 1) {
      if (!unavailableVideoIds.includes(videoList[index].id)) {
        setCurrentVideoIndex(index);
        return true;
      }
    }

    completeSession();
    return false;
  }, [completeSession, unavailableVideoIds, videoList]);

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

  useEffect(() => {
    if (sessionState !== 'running') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        invalidateSession('The experiment was invalidated because you left the tab.');
      }
    };

    const handleBlur = () => {
      invalidateSession('The experiment was invalidated because you switched to another window or app.');
    };

    const handlePageHide = () => {
      invalidateSession('The experiment was invalidated because you left the experiment page.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [invalidateSession, sessionState]);

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
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-3xl rounded-xl border bg-card p-8 shadow-lg">
          <div className="text-center">
            <PartyPopper className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-2xl font-bold">Results Submitted</h1>
            <p className="mt-3 text-muted-foreground">
              Joshua Zamora has finished conducting AP Research, but thank you for completing the experiment and testing this out.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={() => { clearSession(); router.push('/'); }}>
              Return Home
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowResults((prev) => !prev)}>
              {showResults ? 'Hide Results' : 'View Your Results'}
            </Button>
          </div>

          {showResults && (
            <div className="mt-6 rounded-lg border bg-muted/40 p-4 text-left">
              <h2 className="font-semibold text-foreground">Experiment Interaction Log</h2>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Participant ID:</strong> {participantId}</p>
                <p><strong className="text-foreground">Recorded events:</strong> {sessionEvents.length}</p>
              </div>
              <div className="mt-4 max-h-80 overflow-auto rounded-md bg-background p-3">
                <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(sessionEvents, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (sessionState === 'invalidated') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-lg rounded-xl border bg-card p-8 text-center shadow-lg">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Experiment Invalidated</h1>
          <p className="mt-3 text-muted-foreground">
            {invalidationReason || 'This session is no longer valid because the experiment was interrupted.'}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Please contact the researcher before trying again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <SessionTimer
        duration={SESSION_DURATION_SECONDS}
        onComplete={completeSession}
        className="absolute left-4 top-4 z-20"
      />
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
