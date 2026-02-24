
"use client";

import { Suspense, useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TikTokPlayer } from '@/components/tiktok-player';
import { type Video } from '@/lib/videos';
import { getVideos, saveInteraction } from './actions';
import { useSession } from '@/lib/session-context';
import { Loader2, PartyPopper, ServerCrash, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export type SessionData = {
  videoId: string;
  watchTimeMs: number;
  videoDurationMs?: number;
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

  const participantId = contextParticipantId || searchParams.get('participantId');

  useEffect(() => {
    const initSession = async () => {
      if (!participantId) {
        router.replace('/');
        return;
      }

      try {
        const result = await getVideos();
        if (result.success && result.videos && result.videos.length > 0) {
          setVideoList(result.videos);
          setSessionState('running');
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

  const handleInteraction = useCallback((interaction: Omit<SessionData, 'participantId' | 'genre' | 'timestamp'>) => {
    const video = videoList.find(v => v.id === interaction.videoId);
    if (!video || !participantId) return;

    const newRecord: SessionData = {
      ...interaction,
      participantId,
      genre: video.genre,
      timestamp: new Date().toISOString(),
    };

    addSessionEvent(newRecord);
    saveInteraction(newRecord).catch(err => console.error("Failed to transmit interaction:", err));

  }, [participantId, videoList, addSessionEvent]);

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

  const currentVideo = videoList[currentVideoIndex];

  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <div className="flex items-center justify-center">
        {/* Player container */}
        <div className="relative h-screen max-h-screen w-auto overflow-hidden">
          <div
            className="h-full w-full transition-transform duration-500 ease-in-out"
            style={{ transform: `translateY(-${currentVideoIndex * 100}vh)` }}
          >
            {videoList.map((video, index) => (
              <div key={video.id} className="h-screen w-screen flex items-center justify-center">
                <TikTokPlayer
                  video={video}
                  isActive={index === currentVideoIndex}
                  onInteraction={handleInteraction}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Buttons container */}
        <div className="flex flex-col space-y-2 z-10 ml-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={handlePrevVideo}
            disabled={currentVideoIndex === 0}
            className="bg-gray-800 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full"
          >
            <ChevronUp className="h-6 w-6" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleNextVideo}
            disabled={currentVideoIndex >= videoList.length - 1}
            className="bg-gray-800 bg-opacity-50 hover:bg-opacity-75 text-white rounded-full"
          >
            <ChevronDown className="h-6 w-6" />
          </Button>
        </div>
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
