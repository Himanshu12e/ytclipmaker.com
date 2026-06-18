"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from "lucide-react";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  startTime?: number;
  endTime?: number;
}

export function VideoPlayer({ src, poster, title, startTime, endTime }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoaded(true);
      if (startTime !== undefined) {
        video.currentTime = startTime;
        setCurrentTime(startTime);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (endTime !== undefined && video.currentTime >= endTime) {
        video.pause();
        setIsPlaying(false);
      }
    };

    const handleError = () => {
      setError("Failed to load video");
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("error", handleError);
    };
  }, [startTime, endTime]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      if (endTime !== undefined && video.currentTime >= endTime) {
        video.currentTime = startTime ?? 0;
      }
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progress = progressRef.current;
    if (!video || !progress) return;

    const rect = progress.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const skipBack = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 5, startTime ?? 0);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 5, endTime ?? duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const clipDuration = endTime !== undefined && startTime !== undefined ? endTime - startTime : duration;

  if (error) {
    return (
      <div className="relative flex aspect-video w-full items-center justify-center rounded-lg bg-black/50">
        <div className="text-center">
          <Play className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative w-full overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full aspect-video object-contain"
        preload="metadata"
        playsInline
      />

      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 sm:p-4 opacity-0 transition-opacity group-hover:opacity-100">
        <div
          ref={progressRef}
          className="relative mb-3 h-1.5 cursor-pointer rounded-full bg-white/20"
          onClick={handleProgressClick}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-blue-500 transition-all"
            style={{
              width: `${((currentTime - (startTime ?? 0)) / clipDuration) * 100}%`,
            }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 transition-opacity group-hover:opacity-100"
            style={{
              left: `calc(${((currentTime - (startTime ?? 0)) / clipDuration) * 100}% - 6px)`,
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              )}
            </button>

            <button
              onClick={skipBack}
              className="hidden h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 sm:flex"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={skipForward}
              className="hidden h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 sm:flex"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>

            <span className="ml-1 text-xs text-white/80 font-mono">
              {formatTime(currentTime)} / {formatTime(clipDuration)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>

            <button
              onClick={handleFullscreen}
              className="hidden h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 sm:flex"
            >
              <Maximize className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {title && (
        <div className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
          {title}
        </div>
      )}
    </div>
  );
}
