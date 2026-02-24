
"use client";

import { Suspense, useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TikTokPlayer } from '@/components/tiktok-player';
import { type Video } from '@/lib/videos';
import { getVideos, saveInteraction } from './actions';
import { useSession } from '@/lib/session-context';
import { Loader2, PartyPopper, ServerCrash } from 'lucide-react';
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
    <div className="relative h-screen w-screen bg-black flex flex-col items-center justify-center">
      {currentVideo && (
        <TikTokPlayer
          key={currentVideo.id}
          video={currentVideo}
          isActive={true} // The player is always active in this simplified view
          onInteraction={handleInteraction}
        />
      )}
      <div className="absolute bottom-4 right-4">
        <Button onClick={handleNextVideo}>
          {currentVideoIndex < videoList.length - 1 ? 'Next Video' : 'Finish Session'}
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
