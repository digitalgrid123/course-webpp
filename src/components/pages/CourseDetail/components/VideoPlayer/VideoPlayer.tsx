import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { getFullUrl } from "@/utils/helper";
import { createPortal } from "react-dom";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnail?: string | null;
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

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  thumbnail,
  initialProgress = 0,
  onProgress,
  onPause,
}) => {
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [seeking, setSeeking] = useState(false);
  console.log("🚀 ~ VideoPlayer ~ seeking:", seeking);
  const [showControls, setShowControls] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const hasSetInitialProgress = useRef(false);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const sendProgressData = () => {
    const video = videoRef.current;
    if (!video || !onProgress) return;

    onProgress({
      played: video.currentTime / video.duration,
      currentTime: video.currentTime,
      duration: video.duration,
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);

      if (
        initialProgress > 0 &&
        !hasSetInitialProgress.current &&
        video.duration > 0
      ) {
        const seekTime = (initialProgress / 100) * video.duration;
        video.currentTime = seekTime;
        setCurrentTime(seekTime);
        setPlayed(initialProgress / 100);
        hasSetInitialProgress.current = true;

        console.log("Video Player: Seeked to initial progress", {
          initialProgress,
          seekTime,
          duration: video.duration,
          timestamp: new Date().toISOString(),
        });
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [initialProgress]);

  useEffect(() => {
    hasSetInitialProgress.current = false;
  }, [videoUrl]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(event.target as Node)
      ) {
        setShowSettings(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setPlayed(video.currentTime / video.duration);
    };

    const handleEnded = () => {
      setPlaying(false);
      setHasStarted(false);
      if (onProgress) {
        onProgress({
          played: 1,
          currentTime: video.duration,
          duration: video.duration,
        });
      }
    };

    const handlePlay = () => {
      setHasStarted(true);
    };

    const handlePause = () => {
      if (onPause) {
        onPause({
          played: video.currentTime / video.duration,
          currentTime: video.currentTime,
          duration: video.duration,
        });
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [onProgress, onPause]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (playing) {
      video.play();
    } else {
      video.pause();
    }
  }, [playing]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    video.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && onPause) {
        const video = videoRef.current;
        onPause({
          played: video.currentTime / video.duration,
          currentTime: video.currentTime,
          duration: video.duration,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onPause]);

  useEffect(() => {
    return () => {
      if (videoRef.current && onPause) {
        const video = videoRef.current;
        onPause({
          played: video.currentTime / video.duration,
          currentTime: video.currentTime,
          duration: video.duration,
        });
      }
    };
  }, [onPause]);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPlayed = parseFloat(e.target.value);
    setPlayed(newPlayed);
    if (videoRef.current) {
      videoRef.current.currentTime = newPlayed * duration;
    }
  };

  const handleSeekMouseDown = () => {
    setSeeking(true);
  };

  const handleSeekMouseUp = () => {
    setSeeking(false);
    sendProgressData();
  };

  useEffect(() => {
    if (playing && onProgress) {
      progressIntervalRef.current = setInterval(() => {
        sendProgressData();
      }, 10000);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [playing, onProgress]);

  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettings(false);
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const toggleFullscreen = () => {
    const container = videoRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error("Picture-in-Picture error:", error);
    }
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
    resetControlsTimeout();
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    setShowSettings(false);
  };

  return (
    <div className="bg-white rounded-4xl shadow-md overflow-visible">
      <div
        className="bg-gray-900 aspect-video relative rounded-4xl overflow-hidden"
        onMouseMove={resetControlsTimeout}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => {
          if (playing) {
            setShowControls(false);
            setShowSettings(false);
          }
        }}
      >
        {!hasStarted && thumbnail && (
          <div className="absolute inset-0 z-10">
            <Image
              src={getFullUrl(thumbnail)}
              alt="Video thumbnail"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-4xl"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <button
                onClick={handlePlayPause}
                className="w-20 h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all hover:scale-110"
              >
                <svg
                  className="w-10 h-10 text-gray-900 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              {initialProgress > 0 && (
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm">
                  Resume from {initialProgress}%
                </div>
              )}
            </div>
          </div>
        )}

        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          controlsList="nodownload"
          poster={thumbnail || undefined}
          onClick={handlePlayPause}
        />

        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center justify-between text-white text-xs font-mono px-1">
            <span>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="space-y-3">
            <div className="relative group">
              <input
                type="range"
                min={0}
                max={0.999999}
                step="any"
                value={played}
                onChange={handleSeekChange}
                onMouseDown={handleSeekMouseDown}
                onMouseUp={handleSeekMouseUp}
                className="w-full h-1.5 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg"
                style={{
                  direction: "rtl",
                  background: `linear-gradient(to left, #3b82f6 ${
                    played * 100
                  }%, #4b5563 ${played * 100}%)`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center gap-4">
                <div className="relative" ref={settingsRef}>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="hover:text-blue-400 transition-colors p-1"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  </button>

                  {/* Settings Dropdown */}
                  {showSettings &&
                    createPortal(
                      (() => {
                        const rect =
                          settingsRef.current?.getBoundingClientRect();
                        if (!rect) return null;

                        let top = rect.top - 180;
                        const left = rect.left;
                        if (top < 10) top = rect.bottom + 8;

                        return (
                          <div
                            className="absolute bg-gray-800 rounded-lg shadow-xl overflow-hidden min-w-[180px] border border-gray-700 z-50"
                            style={{
                              top,
                              left,
                            }}
                          >
                            <div className="px-4 py-2 border-b border-gray-700">
                              <p className="text-xs font-semibold text-gray-400">
                                Playback Speed
                              </p>
                            </div>
                            <div className="py-1">
                              {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(
                                (speed) => (
                                  <button
                                    key={speed}
                                    onClick={() => handleSpeedChange(speed)}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 transition-colors flex items-center justify-between ${
                                      playbackRate === speed
                                        ? "text-blue-400 bg-gray-700/50"
                                        : "text-white"
                                    }`}
                                  >
                                    <span>
                                      {speed === 1 ? "Normal" : `${speed}x`}
                                    </span>
                                    {playbackRate === speed && (
                                      <svg
                                        className="w-4 h-4"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        );
                      })(),
                      document.body
                    )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMuted(!muted)}
                    className="peer hover:text-blue-400 transition-colors p-1"
                  >
                    {muted || volume === 0 ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                    )}
                  </button>

                  <div className="hidden peer-hover:block">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-20 h-1.5 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 ${
                          volume * 100
                        }%, #4b5563 ${volume * 100}%)`,
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={togglePictureInPicture}
                  className="hover:text-blue-400 transition-colors p-1"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z" />
                  </svg>
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="hover:text-blue-400 transition-colors p-1"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = Math.max(
                        0,
                        currentTime - 10
                      );
                    }
                  }}
                  className="hover:text-blue-400 transition-colors p-1"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
                  </svg>
                </button>

                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = Math.min(
                        duration,
                        currentTime + 10
                      );
                    }
                  }}
                  className="hover:text-blue-400 transition-colors p-1"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
                  </svg>
                </button>
                <button
                  onClick={handlePlayPause}
                  className="hover:text-blue-400 transition-colors p-1 hover:scale-110 transform"
                >
                  {playing ? (
                    <svg
                      className="w-7 h-7"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-7 h-7"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
