import { Heart, MessageCircle, Share2, Music4, Play, Pause } from 'lucide-react';
import type { Video } from '@/lib/videos';
import { cn } from '@/lib/utils';
import { VideoComments } from '@/components/video-comments';
import { useState, useEffect, useRef } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

type InteractionType = 'like' | 'comment' | 'share' | 'skip' | 'view';

export type VideoInteraction = {
  videoId: string;
  interactionType: InteractionType;
  watchTimeMs: number;
};

type VideoPlayerProps = {
  video: Video;
  isActive: boolean;
  onInteraction: (interaction: VideoInteraction) => void;
  getWatchTime: () => number;
};

export function VideoPlayer({ video, isActive, onInteraction, getWatchTime }: VideoPlayerProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const { toast } = useToast();

  // Extract the real YouTube ID safely
  const realVideoId = video.src ? (video.src.split('/').pop() || video.id) : video.id.split('-')[0];

  // Handle Play/Pause
  const togglePlay = () => {
    if (!player || !isPlayerReady) return;
    try {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
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
      onInteraction({ videoId: video.id, interactionType: 'like', watchTimeMs: getWatchTime() });
    }
  };

  const handleComment = () => {
    onInteraction({ videoId: video.id, interactionType: 'comment', watchTimeMs: getWatchTime() });
  };

  const handleShare = async () => {
    onInteraction({ videoId: video.id, interactionType: 'share', watchTimeMs: getWatchTime() });

    // Copy link logic
    const shareUrl = `https://youtube.com/shorts/${realVideoId}`;
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
    if (!player) return;
    const seekTime = (value[0] / 100) * duration;
    player.seekTo(seekTime);
    setProgress(value[0]);
  };

  // Sync progress
  useEffect(() => {
    if (!player || !isPlayerReady || !isPlaying || !isActive) return;

    const interval = setInterval(() => {
      try {
        const currentTime = player.getCurrentTime();
        const totalDuration = player.getDuration();
        if (totalDuration) {
          setDuration(totalDuration);
          setProgress((currentTime / totalDuration) * 100);
        }
      } catch (e) {
        // Ignore errors during progress sync if player is not ready
      }
    }, 200);

    return () => clearInterval(interval);
  }, [player, isPlayerReady, isPlaying, isActive]);

  // Pause when not active
  useEffect(() => {
    if (player && isPlayerReady) {
      try {
        if (isActive) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      } catch (e) {
        console.error("Error in isActive effect:", e);
      }
    }
  }, [isActive, player, isPlayerReady]);

  const onPlayerReady = (event: YouTubeEvent) => {
    setPlayer(event.target);
    setIsPlayerReady(true);
    if (isActive) {
      event.target.playVideo();
    } else {
      event.target.pauseVideo();
    }
  };

  const onPlayerStateChange = (event: YouTubeEvent) => {
    // 1 = playing, 2 = paused
    setIsPlaying(event.data === 1);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-black group">
      {/* YouTube Player Wrapper */}
      <div className="absolute inset-0 h-full w-full pointer-events-none">
        {/* pointer-events-none allows clicks to pass through to our overlay, 
             BUT react-youtube iframe needs to receive some events? 
             Actually, we want to intercept clicks. 
             If we set pointer-events-none on the wrapper, the iframe won't get clicks.
             This is what we want for "Tap to Pause".
             However, the iframe needs to be interactive for internal things? 
             YouTube Iframe API controls allow us to control it programmatically. 
             So disabling pointer events on the iframe is fine as long as we handle everything.
         */}
        <YouTube
          videoId={realVideoId}
          opts={{
            height: '100%',
            width: '100%',
            playerVars: {
              autoplay: 1,
              controls: 0,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              loop: 1,
              playlist: realVideoId,
              playsinline: 1,
              enablejsapi: 1,
              origin: typeof window !== 'undefined' ? window.location.origin : '',
            },
          }}
          className="h-full w-full"
          iframeClassName="h-full w-full object-cover"
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
        />
      </div>

      {/* Tap Overlay for Play/Pause */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlay}
      >
        {/* Play/Pause Animation Overlay */}
        {showControls && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300">
            {isPlaying ? (
              <Play className="h-16 w-16 text-white/80 animate-ping" fill="currentColor" />
            ) : (
              <Pause className="h-16 w-16 text-white/80" fill="currentColor" />
            )}
          </div>
        )}
      </div>

      {/* Gradient for text readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

      {/* Video Info */}
      <div className="absolute bottom-12 left-4 right-16 z-20 text-white drop-shadow-lg pointer-events-none">
        <h3 className="font-bold text-lg">{video.user}</h3>
        <p className="mt-1 text-sm line-clamp-2">{video.caption}</p>
        <div className="mt-2 flex items-center gap-2">
          <Music4 className="h-4 w-4 animate-pulse" />
          <p className="text-sm font-medium">Original Audio - {video.user}</p>
        </div>
      </div>

      {/* Action Buttons - Right Side */}
      <div className="absolute bottom-[20%] right-3 z-30 flex flex-col gap-6 text-white sm:bottom-1/4">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleLike}
            aria-label="Like video"
            className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95", { "bg-rose-500 text-white": isLiked })}>
            <Heart className={cn("h-7 w-7 transition-all", { "fill-current": isLiked })} />
          </button>
          <span className="text-xs font-semibold drop-shadow-md">Like</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div onClick={handleComment}>
            <VideoComments videoId={video.id} realVideoId={realVideoId} />
          </div>
          <span className="text-xs font-semibold drop-shadow-md">Comment</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            aria-label="Share video"
            onClick={handleShare}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            <Share2 className="h-7 w-7" />
          </button>
          <span className="text-xs font-semibold drop-shadow-md">Share</span>
        </div>
      </div>

      {/* Progress Bar - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-2 pb-1 group-hover:pb-2 transition-all">
        <Slider
          defaultValue={[0]}
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={handleSeek}
          className="cursor-pointer h-1.5 hover:h-2 transition-all"
        />
      </div>
    </div>
  );
}
