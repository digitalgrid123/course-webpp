"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface YouTubePlayerProps {
  videoId: string;
  initialProgress?: number;
  onProgress?: (data: {
    played: number;
    currentTime: number;
    duration: number;
  }) => void;
  onPause?: (data: {
    played: number;
    currentTime: number;
    duration: number;
  }) => void;
}

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  initialProgress = 0,
  onProgress,
  onPause,
}) => {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasSetInitialProgress = useRef(false);
  const [isAPIReady, setIsAPIReady] = useState(false);

  const sendProgressData = useCallback(() => {
    const player = playerRef.current;
    if (!player || !onProgress) return;

    try {
      const currentTime =
        typeof player.getCurrentTime === "function"
          ? player.getCurrentTime()
          : 0;
      const duration =
        typeof player.getDuration === "function" ? player.getDuration() : 0;
      const played = duration > 0 ? currentTime / duration : 0;

      onProgress({ played, currentTime, duration });
    } catch (error) {
      console.error("Error getting video progress:", error);
    }
  }, [onProgress]);

  const sendPauseData = useCallback(() => {
    const player = playerRef.current;
    if (!player || !onPause) return;

    try {
      const currentTime =
        typeof player.getCurrentTime === "function"
          ? player.getCurrentTime()
          : 0;
      const duration =
        typeof player.getDuration === "function" ? player.getDuration() : 0;
      const played = duration > 0 ? currentTime / duration : 0;

      onPause({ played, currentTime, duration });
    } catch (error) {
      console.error("Error getting video pause data:", error);
    }
  }, [onPause]);

  const onPlayerReady = useCallback(() => {
    setIsAPIReady(true);

    const player = playerRef.current;
    if (player && initialProgress > 0 && !hasSetInitialProgress.current) {
      try {
        const duration = player.getDuration();
        if (duration > 0) {
          const seekTime = (initialProgress / 100) * duration;
          player.seekTo(seekTime, true);
          hasSetInitialProgress.current = true;

          console.log("YouTube Player: Seeked to initial progress", {
            initialProgress,
            seekTime,
            duration,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Error setting initial progress:", error);
      }
    }
  }, [initialProgress]);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

    progressIntervalRef.current = setInterval(() => {
      sendProgressData();
    }, 10000);
  }, [sendProgressData]);

  const onPlayerStateChange = useCallback(
    (event: YT.OnStateChangeEvent) => {
      if (event.data === YT.PlayerState.PLAYING) {
        startProgressTracking();

        const player = playerRef.current;
        if (player && initialProgress > 0 && !hasSetInitialProgress.current) {
          try {
            const duration = player.getDuration();
            if (duration > 0) {
              const seekTime = (initialProgress / 100) * duration;
              player.seekTo(seekTime, true);
              hasSetInitialProgress.current = true;

              console.log(
                "YouTube Player: Seeked to initial progress on play",
                {
                  initialProgress,
                  seekTime,
                  duration,
                }
              );
            }
          } catch (error) {
            console.error("Error setting initial progress on play:", error);
          }
        }
      } else if (event.data === YT.PlayerState.PAUSED) {
        stopProgressTracking();
        sendPauseData();
      } else if (event.data === YT.PlayerState.ENDED) {
        stopProgressTracking();
        if (onProgress && playerRef.current) {
          const duration = playerRef.current.getDuration();
          onProgress({
            played: 1,
            currentTime: duration,
            duration: duration,
          });
        }
      } else {
        stopProgressTracking();
      }
    },
    [
      onProgress,
      initialProgress,
      startProgressTracking,
      stopProgressTracking,
      sendPauseData,
    ]
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        sendPauseData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sendPauseData]);

  useEffect(() => {
    return () => {
      sendPauseData();
    };
  }, [sendPauseData]);

  useEffect(() => {
    hasSetInitialProgress.current = false;
  }, [videoId]);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initPlayer = () => {
      if (containerRef.current && window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player(containerRef.current, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            fs: 1,
            start:
              initialProgress > 0
                ? Math.floor((initialProgress / 100) * 1000)
                : undefined,
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (progressIntervalRef.current)
        clearInterval(progressIntervalRef.current);
      playerRef.current?.destroy();
    };
  }, [videoId, initialProgress, onPlayerReady, onPlayerStateChange]);

  return (
    <div className="bg-white rounded-4xl shadow-md overflow-hidden">
      <div className="bg-gray-900 aspect-video relative rounded-4xl">
        <div ref={containerRef} className="w-full h-full"></div>
        {!isAPIReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-white text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <p className="text-sm">Loading video...</p>
              {initialProgress > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Resuming from {initialProgress}%
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
