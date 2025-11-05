// hooks/useVideoData.ts
import { useCallback } from "react";

import { getFullUrl } from "@/utils/helper";
import { CourseDetail } from "@/types";

export const useVideoData = (
  courseDetail: CourseDetail | null,
  selectedLesson: number | null
) => {
  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com") || url.includes("youtu.be");
  };

  const getYouTubeVideoId = (url: string) => {
    let videoId = "";

    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    }

    return videoId;
  };

  const getVideoData = useCallback(() => {
    if (!courseDetail?.modules || !selectedLesson) {
      return {
        url: null,
        videoId: null,
        isYouTube: false,
        thumbnail: courseDetail?.image || null,
        lessonName: null,
        lessonType: null,
        meetingLink: null,
        scheduleDateTime: null,
        details: courseDetail?.details || null,
      };
    }

    // Find the current lesson
    let currentLesson = null;
    for (const courseModule of courseDetail.modules) {
      if (courseModule.lessons && courseModule.lessons.length > 0) {
        for (const lesson of courseModule.lessons) {
          if (lesson.id === selectedLesson) {
            currentLesson = lesson;
            break;
          }
        }
      }
      if (currentLesson) break;
    }

    if (!currentLesson) {
      return {
        url: null,
        videoId: null,
        isYouTube: false,
        thumbnail: courseDetail?.image || null,
        lessonName: null,
        lessonType: null,
        meetingLink: null,
        scheduleDateTime: null,
        details: courseDetail?.details || null,
      };
    }

    // Handle meeting lessons (type 3)
    if (currentLesson.type === 3 && currentLesson.link) {
      return {
        url: null,
        videoId: null,
        isYouTube: false,
        thumbnail: currentLesson.thumbnail || courseDetail?.image,
        lessonName: currentLesson.name,
        lessonType: 3,
        meetingLink: currentLesson.link,
        scheduleDateTime: currentLesson.schedule_datetime,
        details: currentLesson.details || courseDetail?.details || null,
      };
    }

    // Handle video lessons
    const videoUrl = currentLesson.video || currentLesson.link || null;
    const isYT = videoUrl ? isYouTubeUrl(videoUrl) : false;
    const videoId = videoUrl && isYT ? getYouTubeVideoId(videoUrl) : null;
    const fullVideoUrl = videoUrl && !isYT ? getFullUrl(videoUrl) : videoUrl;

    return {
      url: fullVideoUrl,
      videoId: videoId,
      isYouTube: isYT,
      thumbnail: currentLesson.thumbnail || courseDetail?.image,
      lessonName: currentLesson.name,
      lessonType: currentLesson.type,
      meetingLink: null,
      scheduleDateTime: null,
      details: currentLesson.details || courseDetail?.details || null,
    };
  }, [courseDetail, selectedLesson]);

  return getVideoData();
};
