"use client";

import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

type SessionTimerProps = {
  duration: number; // in seconds
  onComplete: () => void;
  className?: string;
};

export function SessionTimer({ duration, onComplete, className }: SessionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={cn(
      "flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-white font-mono text-sm shadow-lg backdrop-blur-sm",
      className
    )}>
      <Timer className="h-4 w-4" />
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
