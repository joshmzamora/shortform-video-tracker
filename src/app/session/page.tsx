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
  watchTimeSeconds: number;
  videoDurationMs?: number;
  interactionType: 'view';
  videoOrder: number;
  videoCaption: string;
  participantId: string;
  genre: string;
  timestamp: string;
};

type SessionState = 'initializing' | 'running' | 'completed' | 'invalidated' | 'error';

const GENRE_ORDER = ['Doomscroll', 'Educational', 'Entertainment', 'Inspirational', 'Relatable'];

function formatMilliseconds(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}

function formatClockDuration(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

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
  const [hasStarted, setHasStarted] = useState(false);
  const [showResearcherPanel, setShowResearcherPanel] = useState(false);
  const invalidationHandledRef = useRef(false);
  const completionHandledRef = useRef(false);
  const navigationLockRef = useRef(false);
  const pressedKeysRef = useRef<Set<string>>(new Set());

  const participantId = contextParticipantId || searchParams.get('participantId');
  const researcherMode = searchParams.get('researcherMode') === '1';
  const sessionEventsByVideo = sessionEvents.reduce<Map<string, SessionData[]>>((map, event) => {
    const existing = map.get(event.videoId) ?? [];
    existing.push(event as SessionData);
    map.set(event.videoId, existing);
    return map;
  }, new Map());

  const genreSummary = GENRE_ORDER.map((genre) => {
    const eventsForGenre = sessionEvents.filter((event) => event.genre === genre) as SessionData[];
    const totalWatchTimeMs = eventsForGenre.reduce((sum, event) => sum + event.watchTimeMs, 0);
    const totalVideos = new Set(eventsForGenre.map((event) => event.videoId)).size;

    return {
      genre,
      totalVideos,
      totalWatchTimeMs,
      averageWatchTimeMs: totalVideos > 0 ? Math.round(totalWatchTimeMs / totalVideos) : 0,
    };
  }).sort((a, b) => b.totalWatchTimeMs - a.totalWatchTimeMs);
  const topGenre = genreSummary[0]?.totalWatchTimeMs ? genreSummary[0] : null;
  const viewedVideoIds = new Set(sessionEvents.map((event) => event.videoId));
  const availableVideoCount = Math.max(0, videoList.length - unavailableVideoIds.length);
  const totalWatchTimeMs = sessionEvents.reduce((sum, event) => sum + event.watchTimeMs, 0);
  const totalVideosViewed = viewedVideoIds.size;
  const totalVideosSkipped = Math.max(0, availableVideoCount - totalVideosViewed);

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
      registerLink('prefetch', `https://www.tiktok.com/player/v1/${videoId}?loop=1&controls=1&autoplay=1&muted=1`, 'document');
    });

    return () => {
      links.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, [videoList]);

  const unlockNavigationSoon = useCallback(() => {
    window.setTimeout(() => {
      navigationLockRef.current = false;
    }, 450);
  }, []);

  const handleInteraction = useCallback((interaction: TikTokInteraction) => {
    const video = videoList.find((entry) => entry.id === interaction.videoId);
    if (!video || !participantId || !sessionId) return;

    const newRecord: SessionData = {
      ...interaction,
      interactionType: 'view',
      watchTimeSeconds: Math.round(interaction.watchTimeMs / 1000),
      videoOrder: videoList.findIndex((entry) => entry.id === interaction.videoId) + 1,
      videoCaption: video.caption,
      participantId,
      genre: video.genre,
      timestamp: new Date().toISOString(),
    };

    addSessionEvent(newRecord);
    saveInteraction(sessionId, newRecord).catch((err) => console.error("Failed to transmit interaction:", err));
  }, [addSessionEvent, participantId, sessionId, videoList]);

  const handlePrevVideo = () => {
    if (navigationLockRef.current) return;
    if (currentVideoIndex > 0) {
      navigationLockRef.current = true;
      setCurrentVideoIndex(currentVideoIndex - 1);
      unlockNavigationSoon();
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
    setHasStarted(false);
    setShowResults(false);
    setSessionState('completed');
  }, []);

  const advanceToNextAvailable = useCallback((startIndex: number) => {
    for (let index = startIndex + 1; index < videoList.length; index += 1) {
      if (!unavailableVideoIds.includes(videoList[index].id)) {
        navigationLockRef.current = true;
        setCurrentVideoIndex(index);
        unlockNavigationSoon();
        return true;
      }
    }

    completeSession();
    return false;
  }, [completeSession, unavailableVideoIds, unlockNavigationSoon, videoList]);

  const handleNextVideo = useCallback(() => {
    if (navigationLockRef.current) return;
    advanceToNextAvailable(currentVideoIndex);
  }, [advanceToNextAvailable, currentVideoIndex]);

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
    if (sessionState !== 'running' || !hasStarted || researcherMode) return;

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
  }, [hasStarted, invalidateSession, researcherMode, sessionState]);

  useEffect(() => {
    if (sessionState !== 'running' || !hasStarted) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || pressedKeysRef.current.has(event.key)) {
        event.preventDefault();
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        pressedKeysRef.current.add(event.key);
        handleNextVideo();
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        pressedKeysRef.current.add(event.key);
        handlePrevVideo();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeysRef.current.delete(event.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      pressedKeysRef.current.clear();
    };
  }, [handleNextVideo, hasStarted, sessionState]);

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
              Thanks for completing this test. Joshua Zamora has already finished AP Research, but your submission still helps a lot.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={() => { clearSession(); router.push('/'); }}>
              Return Home
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setShowResults((prev) => !prev)}>
              {showResults ? 'Hide Results' : 'View Your Results'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => downloadJson(`experiment-results-${participantId}.json`, {
                participantId,
                totalSessionTimeMs: totalWatchTimeMs,
                totalVideosViewed,
                totalVideosSkipped,
                unavailableVideoCount: unavailableVideoIds.length,
                topGenre,
                totalEvents: sessionEvents.length,
                genreSummary,
                sessionEvents,
              })}
            >
              Download Results
            </Button>
          </div>

          {showResults && (
            <div className="mt-6 rounded-lg border bg-muted/40 p-4 text-left">
              <h2 className="font-semibold text-foreground">Experiment Interaction Log</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Total Session Time</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{formatClockDuration(totalWatchTimeMs)}</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Videos Viewed</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{totalVideosViewed}</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Skipped / Not Reached</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{totalVideosSkipped}</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Unavailable</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{unavailableVideoIds.length}</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border bg-background p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Top Genre by Dwell Time</p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {topGenre ? `${topGenre.genre} (${formatMilliseconds(topGenre.totalWatchTimeMs)})` : 'No viewing data recorded'}
                </p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Participant ID:</strong> {participantId}</p>
                  <p><strong className="text-foreground">Recorded events:</strong> {sessionEvents.length}</p>
                </div>
              </div>
              <div className="mt-6 overflow-x-auto rounded-md border bg-background">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60 text-left">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Genre</th>
                      <th className="px-3 py-2 font-semibold">Videos Viewed</th>
                      <th className="px-3 py-2 font-semibold">Total Dwell Time</th>
                      <th className="px-3 py-2 font-semibold">Average per Video</th>
                    </tr>
                  </thead>
                  <tbody>
                    {genreSummary.map((row) => (
                      <tr
                        key={row.genre}
                        className={`border-t ${topGenre?.genre === row.genre ? 'bg-primary/5' : ''}`}
                      >
                        <td className="px-3 py-2">{row.genre}</td>
                        <td className="px-3 py-2">{row.totalVideos}</td>
                        <td className="px-3 py-2">{formatMilliseconds(row.totalWatchTimeMs)}</td>
                        <td className="px-3 py-2">{formatMilliseconds(row.averageWatchTimeMs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 max-h-80 overflow-auto rounded-md bg-background p-3">
                <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(
                  sessionEvents.map((event) => ({
                    ...event,
                    watchTimeLabel: formatMilliseconds(event.watchTimeMs),
                    visitsForVideo: sessionEventsByVideo.get(event.videoId)?.length ?? 1,
                  })),
                  null,
                  2
                )}</pre>
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
      {hasStarted && (
        <SessionTimer
          duration={SESSION_DURATION_SECONDS}
          onComplete={completeSession}
          className="absolute left-4 top-4 z-20"
        />
      )}
      <div
        className="h-full w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateY(-${currentVideoIndex * 100}vh)` }}
      >
        {videoList.map((video, index) => (
          <div key={video.id} className="flex h-screen w-screen items-center justify-center">
            <TikTokPlayer
              video={video}
              isActive={hasStarted && index === currentVideoIndex}
              onInteraction={handleInteraction}
              shouldMount={index <= currentVideoIndex + PREMOUNT_VIDEO_COUNT}
              onUnavailable={handleVideoUnavailable}
            />
          </div>
        ))}
      </div>

      {!hasStarted && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-white/15 bg-black/80 p-6 text-white shadow-2xl">
            <h1 className="text-2xl font-semibold">Begin Experiment</h1>
            <p className="mt-3 text-sm text-white/80">
              When you start, the first video will begin right away with sound if your browser allows it.
            </p>
            <div className="mt-4 rounded-lg border border-white/15 bg-white/5 p-4 text-sm text-white/85">
              <p className="font-medium text-white">Before you begin</p>
              <p className="mt-2">Use headphones or make sure your volume is on.</p>
              <p className="mt-2">Stay on this tab and do not switch apps or windows during the experiment.</p>
              <p className="mt-2">Use the side buttons or your keyboard up and down arrows to move between videos.</p>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" onClick={() => setHasStarted(true)}>
                Begin Experiment
              </Button>
              <Button variant="outline" className="flex-1 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => router.push('/')}>
                Return Home
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col space-y-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handlePrevVideo}
          disabled={!hasStarted || currentVideoIndex === 0}
          className="h-12 w-12 rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-transform duration-200 hover:scale-110 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronUp className="h-7 w-7" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleNextVideo}
          disabled={!hasStarted}
          className="h-12 w-12 rounded-full border border-white/20 bg-white/10 text-white shadow-lg backdrop-blur-md transition-transform duration-200 hover:scale-110 hover:bg-white/20"
        >
          <ChevronDown className="h-7 w-7" />
        </Button>
      </div>

      {hasStarted && (
        <div className="absolute bottom-4 left-4 z-20 rounded-full border border-white/15 bg-black/50 px-3 py-2 text-xs text-white/80 backdrop-blur-md">
          Use the side arrows or keyboard up/down keys to move through the feed.
        </div>
      )}

      {researcherMode && sessionState === 'running' && (
        <div className="absolute bottom-4 left-4 z-30 max-w-sm rounded-xl border border-amber-300/30 bg-black/75 p-3 text-white shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-200">Researcher Mode</p>
              <p className="text-xs text-white/70">Invalidation is bypassed for testing.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
              onClick={() => setShowResearcherPanel((prev) => !prev)}
            >
              {showResearcherPanel ? 'Hide' : 'Show'}
            </Button>
          </div>

          {showResearcherPanel && (
            <div className="mt-3 space-y-3 text-xs text-white/80">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p>Current video: {currentVideoIndex + 1} / {videoList.length}</p>
                <p>Events recorded: {sessionEvents.length}</p>
                <p>Unavailable videos: {unavailableVideoIds.length}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setHasStarted(true)}>
                  Start
                </Button>
                <Button size="sm" variant="outline" onClick={completeSession}>
                  Jump to Completion
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const currentVideo = videoList[currentVideoIndex];
                    if (currentVideo) {
                      handleVideoUnavailable(currentVideo.id);
                    }
                  }}
                >
                  Simulate Unavailable
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
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
