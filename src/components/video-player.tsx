import { Heart, MessageCircle, Share2, Music4 } from 'lucide-react';
import type { Video } from '@/lib/videos';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
  
  const handleShare = () => {
    onInteraction({ videoId: video.id, interactionType: 'share', watchTimeMs: getWatchTime() });
  };
  
  const videoSrc = `${video.src}?autoplay=1&mute=1&controls=0&loop=1&playlist=${video.id}&modestbranding=1&showinfo=0&rel=0`;

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl bg-black">
      {/* The iframe is set to pointer-events-none to allow the parent carousel to handle scroll events. */}
      {isActive ? (
        <iframe
          key={video.id}
          src={videoSrc}
          title={video.caption}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute top-0 left-0 h-full w-full pointer-events-none"
        ></iframe>
      ) : (
        <div className="h-full w-full rounded-xl bg-black" />
      )}

      {/* Gradient for text readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
      
      {/* Video Info */}
      <div className="absolute bottom-4 left-4 right-4 z-10 text-white drop-shadow-lg pointer-events-none">
        <h3 className="font-bold">{video.user}</h3>
        <p className="mt-1 text-sm">{video.caption}</p>
        <div className="mt-2 flex items-center gap-2">
          <Music4 className="h-4 w-4 animate-pulse" />
          <p className="text-sm font-medium">Original Audio - {video.user}</p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="absolute bottom-[20%] right-3 z-20 flex flex-col gap-4 text-white sm:bottom-1/4">
          <div className="flex flex-col items-center gap-2">
              <button 
                  onClick={handleLike}
                  aria-label="Like video"
                  className={cn("flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95", { "bg-rose-500 text-white": isLiked })}>
                  <Heart className={cn("h-7 w-7 transition-all", { "fill-current": isLiked })} />
              </button>
              <span className="text-xs font-semibold text-white drop-shadow-md pointer-events-none">Like</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button aria-label="Comment on video" onClick={handleComment} className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white transition-transform duration-200 hover:scale-110 active:scale-95">
                <MessageCircle className="h-7 w-7" />
            </button>
            <span className="text-xs font-semibold text-white drop-shadow-md pointer-events-none">Comment</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <button aria-label="Share video" onClick={handleShare} className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white transition-transform duration-200 hover:scale-110 active:scale-95">
                <Share2 className="h-7 w-7" />
            </button>
            <span className="text-xs font-semibold text-white drop-shadow-md pointer-events-none">Share</span>
          </div>
      </div>
    </div>
  );
}
