// components/VideoContent/VideoContent.tsx
import React from "react";
import Image from "next/image";
import { YouTubePlayer } from "../VideoPlayer/YouTubePlayer";
import { VideoPlayer } from "../VideoPlayer/VideoPlayer";
import { getFullUrl } from "@/utils/helper";
import { VideoData } from "@/types";

interface VideoContentProps {
  videoData: VideoData;
  onProgress: (data: {
    played: number;
    currentTime: number;
    duration: number;
  }) => void;
  onPause: (data: {
    played: number;
    currentTime: number;
    duration: number;
  }) => void;
  initialProgress: number;
}

export const VideoContent: React.FC<VideoContentProps> = ({
  videoData,
  onProgress,
  onPause,
  initialProgress,
}) => {
  if (videoData.lessonType === 3 && videoData.meetingLink) {
    return <MeetingContent videoData={videoData} />;
  }

  if (videoData.isYouTube && videoData.videoId) {
    return (
      <YouTubePlayer
        videoId={videoData.videoId}
        onProgress={onProgress}
        onPause={onPause}
        initialProgress={initialProgress}
      />
    );
  }

  if (videoData.url) {
    return (
      <VideoPlayer
        videoUrl={videoData.url}
        thumbnail={videoData.thumbnail}
        onProgress={onProgress}
        onPause={onPause}
        initialProgress={initialProgress}
      />
    );
  }

  return <PlaceholderVideo thumbnail={videoData.thumbnail} />;
};

// Props for MeetingContent
interface MeetingContentProps {
  videoData: VideoData;
}

const MeetingContent: React.FC<MeetingContentProps> = ({ videoData }) => {
  const formatScheduleDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return null;
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const schedule = videoData.scheduleDateTime
    ? formatScheduleDateTime(videoData.scheduleDateTime)
    : null;

  // Fix: Ensure meetingLink is always a string
  const meetingLink = videoData.meetingLink || "#";

  return (
    <div className="bg-white rounded-4xl shadow-md overflow-hidden">
      <div className="bg-gray-900 aspect-video relative rounded-4xl flex items-center justify-center">
        {videoData.thumbnail && (
          <Image
            src={getFullUrl(videoData.thumbnail)}
            alt={videoData.lessonName || ""}
            fill
            style={{ objectFit: "cover" }}
            className="opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent"></div>

        <div className="relative z-10 text-center text-white px-8">
          <svg
            className="w-20 h-20 mx-auto mb-6"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          <h3 className="text-2xl font-bold mb-4">שיעור זום/גוגל מיט</h3>
          {schedule && (
            <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm mb-2">תאריך ושעה:</p>
              <p className="text-xl font-bold">
                {schedule.date} בשעה {schedule.time}
              </p>
            </div>
          )}
          <a
            href={meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-amber-gold hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            הצטרף לשיעור
          </a>
        </div>
      </div>
    </div>
  );
};

// Props for PlaceholderVideo
interface PlaceholderVideoProps {
  thumbnail: string | null;
}

const PlaceholderVideo: React.FC<PlaceholderVideoProps> = ({ thumbnail }) => (
  <div className="bg-white rounded-4xl shadow-md overflow-hidden">
    <div className="bg-gray-900 aspect-video relative rounded-4xl flex items-center justify-center">
      {thumbnail ? (
        <Image
          src={getFullUrl(thumbnail)}
          alt="Course thumbnail"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-80"
        />
      ) : (
        <div className="text-white text-center">
          <svg
            className="w-20 h-20 mx-auto mb-4 opacity-50"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
          </svg>
          <p className="text-lg">אין וידאו זמין</p>
          <p className="text-sm text-gray-400 mt-2">בחר שיעור מהתפריט</p>
        </div>
      )}
    </div>
  </div>
);
