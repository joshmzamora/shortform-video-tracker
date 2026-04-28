import { Heart, MessageCircle, Share2, Music4, Play, Pause } from 'lucide-react';
import type { Video } from '@/lib/videos';
import { cn } from '@/lib/utils';
import { VideoComments } from '@/components/video-comments';
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

type InteractionType = 'like' | 'comment' | 'share' | 'skip' | 'view';

export type VideoInteraction = {
  videoId: string;
  interactionType: InteractionType;
  watchTimeMs: number;
  dwellTimeMs?: number;
  retentionRate?: number;
};

type VideoPlayerProps = {
  video: Video;
  onInteraction: (interaction: VideoInteraction) => void;
  disableSocialButtons?: boolean;
};

export type VideoPlayerRef = {
  play: () => void;
  pause: () => void;
};

export const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({ video, onInteraction, disableSocialButtons }, ref) => {
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const { toast } = useToast();
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const dwellTimeStart = useRef<number | null>(null);
  const totalWatchTime = useRef(0);

  useImperativeHandle(ref, () => ({
    play: () => {
      if (videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    },
    pause: () => {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    },
  }));

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    try {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      setShowControls(true);
      setTimeout(() => setShowControls(false), 1000);
    } catch (e) {
      console.error("Error toggling play:", e);
    }
  };

  const handleLike = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    if (newLikedState) {
      onInteraction({ videoId: video.id, interactionType: 'like', watchTimeMs: totalWatchTime.current });
    }
  };

  const handleComment = () => {
    onInteraction({ videoId: video.id, interactionType: 'comment', watchTimeMs: totalWatchTime.current });
  };

  const handleShare = async () => {
    onInteraction({ videoId: video.id, interactionType: 'share', watchTimeMs: totalWatchTime.current });

    // Copy link logic
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${video.src}` : video.src;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Video link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Share Failed",
        description: "Could not copy link to clipboard.",
      });
    }
  };

  const handleSeek = (value: number[]) => {
    if (!videoRef.current) return;
    const seekTime = (value[0] / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setProgress(value[0]);
  };

  // Sync progress
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleTimeUpdate = () => {
      if (videoEl.duration) {
        setDuration(videoEl.duration);
        setProgress((videoEl.currentTime / videoEl.duration) * 100);
      }
    };

    videoEl.addEventListener('timeupdate', handleTimeUpdate);
    return () => videoEl.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Video is in view
          dwellTimeStart.current = Date.now();
          videoEl.play().catch(e => {
            console.log("Autoplay blocked or failed", e);
            setIsPlaying(false);
          });
          setIsPlaying(true);
        } else {
          // Video is out of view
          if (dwellTimeStart.current) {
            const dwellTime = Date.now() - dwellTimeStart.current;
            totalWatchTime.current += dwellTime;
            const retention = duration > 0 ? (totalWatchTime.current / (duration * 1000)) : 0;
            onInteraction({
              videoId: video.id,
              interactionType: 'view',
              watchTimeMs: totalWatchTime.current,
              dwellTimeMs: dwellTime,
              retentionRate: retention,
            });
          }
          videoEl.pause();
          setIsPlaying(false);
        }
      });
    };

    intersectionObserver.current = new IntersectionObserver(handleIntersection, {
      threshold: 0.5, // 50% of the video must be visible
    });

    intersectionObserver.current.observe(videoEl);

    return () => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }
    };
  }, [video.id, onInteraction]);

  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);

  const formatCount = (count?: number) => {
    if (count === undefined) return "Like";
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  return (
    <div className="relative h-full w-full bg-black flex justify-center items-center overflow-hidden">
      {/* Blurred Background for Desktop (Optional, enhances "fill" feel) */}
      <div className="absolute inset-0 z-0 hidden md:block opacity-20 pointer-events-none">
        <video
          src={video.src}
          className="h-full w-full object-cover blur-3xl scale-110"
          muted
          loop
          playsInline
        />
      </div>

      {/* Main Player Container - Constrained for vertical aspect ratio on desktop, full on mobile */}
      <div className="relative h-full w-full bg-black group shadow-2xl">
        {/* HTML5 Video Player */}
        <video
          ref={videoRef}
          src={video.src}
          className="h-full w-full object-contain"
          loop
          preload="auto"
          playsInline
          muted={false}
          onPlay={onPlay}
          onPause={onPause}
          onClick={togglePlay}
        />

        {/* Tap Overlay for Play/Pause */}
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={togglePlay}
        >
          {/* Play/Pause Animation Overlay */}
          {showControls && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 pointer-events-none">
              {isPlaying ? (
                <Play className="h-16 w-16 text-white/80 animate-ping" fill="currentColor" />
              ) : (
                <Pause className="h-16 w-16 text-white/80" fill="currentColor" />
              )}
            </div>
          )}
        </div>

        {/* Gradient for text readability */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/10 pointer-events-none" />

        {/* Video Info */}
        <div className="absolute bottom-8 left-4 right-16 z-20 text-white drop-shadow-lg pointer-events-none">
          <h3 className="font-bold text-lg">{video.user}</h3>
          <p className="mt-1 text-sm line-clamp-2 leading-relaxed">{video.caption}</p>
          <div className="mt-2 flex items-center gap-2 opacity-90">
            <Music4 className="h-4 w-4 animate-pulse" />
            <p className="text-sm font-medium">Original Audio - {video.user}</p>
          </div>
        </div>

        {/* Action Buttons - Right Side */}
        <div className="absolute bottom-20 right-2 z-30 flex flex-col gap-6 text-white">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleLike(); }}
              disabled={disableSocialButtons}
              aria-label="Like video"
              className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white transition-all duration-200 hover:scale-110 active:scale-95 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50", { "bg-rose-500/80 hover:bg-rose-600 text-white": isLiked })}>
              <Heart className={cn("h-6 w-6 transition-all", { "fill-current": isLiked })} />
            </button>
            <span className="text-xs font-semibold drop-shadow-md">
              {formatCount(video.metadata?.likeCount)}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div onClick={(e) => e.stopPropagation()}>
              <VideoComments videoId={video.id} realVideoId={video.id} disabled={disableSocialButtons} />
            </div>
            <span className="text-xs font-semibold drop-shadow-md">Comment</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              aria-label="Share video"
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              disabled={disableSocialButtons}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white transition-transform duration-200 hover:scale-110 active:scale-95 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Share2 className="h-6 w-6" />
            </button>
            <span className="text-xs font-semibold drop-shadow-md">Share</span>
          </div>
        </div>

        {/* Progress Bar - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-40 px-0 pb-0 group-hover:h-3 transition-all h-1" onClick={(e) => e.stopPropagation()}>
          <Slider
            defaultValue={[0]}
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer w-full h-full"
          />
        </div>
      </div>
    </div>
  );
});
