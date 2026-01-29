"use client";

import { Suspense, useCallback, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { VideoPlayer, type VideoInteraction } from '@/components/video-player';
import { SessionTimer } from '@/components/session-timer';
import { videos } from '@/lib/videos';
import { saveSessionData } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PartyPopper, ServerCrash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

const SESSION_DURATION_SECONDS = 600; // 10 minutes
const SKIP_THRESHOLD_MS = 3000; // 3 seconds

export type SessionData = VideoInteraction & {
  participantId: string;
  genre: string;
  timestamp: string;
};

type SessionState = 'initializing' | 'running' | 'completed' | 'exporting' | 'error';

function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const participantId = searchParams.get('participantId');
  const { toast } = useToast();

  const [api, setApi] = useState<CarouselApi>();
  const [sessionState, setSessionState] = useState<SessionState>('initializing');
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const watchTimeStartRef = useRef<number>(0);
  const sessionDataRef = useRef<SessionData[]>([]);

  useEffect(() => {
    sessionDataRef.current = sessionData;
  }, [sessionData]);

  useEffect(() => {
    if (!participantId) {
      router.replace('/');
    } else {
      setSessionState('running');
      watchTimeStartRef.current = Date.now();
    }
  }, [participantId, router]);

  const handleInteraction = useCallback((interaction: VideoInteraction) => {
    const video = videos.find(v => v.id === interaction.videoId);
    if (!video || !participantId) return;

    const newRecord: SessionData = {
      ...interaction,
      participantId,
      genre: video.genre,
      timestamp: new Date().toISOString(),
    };
    setSessionData(prevData => [...prevData, newRecord]);
  }, [participantId]);

  const getWatchTime = useCallback(() => {
    if (watchTimeStartRef.current === 0) return 0;
    return Date.now() - watchTimeStartRef.current;
  }, []);

  const handleSessionComplete = useCallback(async () => {
    setSessionState('exporting');
    
    const finalWatchTime = getWatchTime();
    const finalViewRecord: SessionData = {
      videoId: videos[currentVideoIndex].id,
      interactionType: 'view',
      watchTimeMs: finalWatchTime,
      participantId: participantId!,
      genre: videos[currentVideoIndex].genre,
      timestamp: new Date().toISOString(),
    };

    const finalData = [...sessionDataRef.current, finalViewRecord];
    setSessionData(finalData);

    try {
      const result = await saveSessionData(finalData);
      if (result.success) {
        setSessionState('completed');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Failed to save session data:", error);
      setSessionState('error');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save session data to the server.",
      });
    }
  }, [currentVideoIndex, getWatchTime, participantId, toast]);

  useEffect(() => {
    if (!api) return;

    const onSelect = (carouselApi: CarouselApi) => {
      const newIndex = carouselApi.selectedScrollSnap();
      const previousIndex = currentVideoIndex;

      const watchTimeMs = getWatchTime();
      const interactionType = watchTimeMs < SKIP_THRESHOLD_MS ? 'skip' : 'view';

      handleInteraction({
        videoId: videos[previousIndex].id,
        interactionType,
        watchTimeMs,
      });

      watchTimeStartRef.current = Date.now();
      setCurrentVideoIndex(newIndex);
    };

    api.on("select", onSelect);
    return () => { api.off("select", onSelect) };
  }, [api, currentVideoIndex, getWatchTime, handleInteraction]);

  if (sessionState === 'initializing') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (sessionState === 'running') {
    return (
      <div className="relative h-screen w-screen bg-black">
        <Carousel
          setApi={setApi}
          opts={{ align: "start" }}
          orientation="vertical"
          className="h-full"
        >
          <CarouselContent className="-mt-0 h-full">
            {videos.map((video, index) => (
              <CarouselItem key={video.id} className="pt-0">
                <VideoPlayer
                  video={video}
                  isActive={index === currentVideoIndex}
                  onInteraction={handleInteraction}
                  getWatchTime={getWatchTime}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <SessionTimer
          duration={SESSION_DURATION_SECONDS}
          onComplete={handleSessionComplete}
          className="absolute top-4 right-4 z-10"
        />
      </div>
    );
  }

  const renderEndScreen = (title: string, description: string, icon: React.ReactNode, content?: React.ReactNode) => (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/50">
            {icon}
          </div>
          <CardTitle className="mt-4 text-2xl font-headline">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {content && <CardContent>{content}</CardContent>}
      </Card>
    </main>
  );

  if (sessionState === 'exporting') {
    return renderEndScreen(
      "Session Complete!",
      "Thank you for your participation. Your session data is being saved.",
      <Loader2 className="h-8 w-8 animate-spin text-accent-foreground" />
    );
  }

  if (sessionState === 'completed') {
    return renderEndScreen(
      "Data Exported",
      "Your session has been successfully recorded. You may close this window. A copy of the recorded data is shown below.",
      <PartyPopper className="h-8 w-8 text-accent-foreground" />,
      <Textarea
        readOnly
        className="mt-4 max-h-60 w-full overflow-auto rounded-md bg-muted p-4 text-left text-xs"
        value={JSON.stringify(sessionData, null, 2)}
        rows={10}
      />
    );
  }
  
  if (sessionState === 'error') {
    return renderEndScreen(
      "An Error Occurred",
      "We couldn't save your session data. Please contact the study administrator.",
      <ServerCrash className="h-8 w-8 text-destructive" />
    );
  }

  return null;
}

export default function SessionPageWrapper() {
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <SessionPage />
    </Suspense>
  );
}
