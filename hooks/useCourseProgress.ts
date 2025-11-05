// hooks/useCourseProgress.ts
import { useState, useCallback, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import {
  updateLessonProgress,
  updateLocalProgress,
} from "@/store/slices/courseSlice";

export const useCourseProgress = (courseId: number | undefined) => {
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [initialProgress, setInitialProgress] = useState<number>(0);
  const [lastProgressUpdate, setLastProgressUpdate] = useState<number>(0);
  const progressUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedProgress = useRef<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();

  const sendProgressUpdate = useCallback(
    (
      lessonId: number,
      progressPercentage: number,
      currentSavedProgress: number
    ) => {
      if (
        !courseId ||
        progressPercentage <= currentSavedProgress ||
        currentSavedProgress >= 100
      ) {
        return;
      }

      dispatch(
        updateLocalProgress({
          lessonId,
          progress: progressPercentage,
          courseId,
        })
      );

      dispatch(
        updateLessonProgress({
          lesson_id: lessonId,
          progress: progressPercentage,
          courseId,
        })
      );
    },
    [dispatch, courseId]
  );

  const debouncedProgressUpdate = useCallback(
    (
      lessonId: number,
      progressPercentage: number,
      currentSavedProgress: number
    ) => {
      if (
        currentSavedProgress >= 100 ||
        progressPercentage <= currentSavedProgress
      ) {
        return;
      }

      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current);
      }

      progressUpdateRef.current = setTimeout(() => {
        sendProgressUpdate(lessonId, progressPercentage, currentSavedProgress);
      }, 2000);
    },
    [sendProgressUpdate]
  );

  const handleVideoProgress = useCallback(
    (
      data: { played: number; currentTime: number; duration: number },
      selectedLesson: number | null,
      currentSavedProgress: number
    ) => {
      if (!selectedLesson || !hasInitializedProgress.current) return;

      if (currentSavedProgress >= 100) return;

      const progressPercentage = Math.floor(data.played * 100);
      const finalProgress = Math.max(
        progressPercentage,
        currentSavedProgress,
        initialProgress
      );
      setCurrentProgress(finalProgress);

      const shouldUpdate =
        finalProgress >= 95 || finalProgress >= currentSavedProgress + 5;

      if (shouldUpdate && finalProgress > lastProgressUpdate) {
        setLastProgressUpdate(finalProgress);
        debouncedProgressUpdate(
          selectedLesson,
          finalProgress,
          currentSavedProgress
        );
      }
    },
    [lastProgressUpdate, initialProgress, debouncedProgressUpdate]
  );

  const handleVideoPause = useCallback(
    (
      data: { played: number; currentTime: number; duration: number },
      selectedLesson: number | null,
      currentSavedProgress: number
    ) => {
      if (
        !selectedLesson ||
        !hasInitializedProgress.current ||
        currentSavedProgress >= 100
      ) {
        return;
      }

      if (
        !data ||
        !Number.isFinite(data.played) ||
        !Number.isFinite(data.duration)
      ) {
        return;
      }

      const progressPercentage = Math.floor(
        (data.currentTime / data.duration) * 100
      );
      const finalProgress = Math.max(
        progressPercentage,
        currentSavedProgress,
        initialProgress
      );

      if (finalProgress > currentSavedProgress) {
        setCurrentProgress(finalProgress);
        sendProgressUpdate(selectedLesson, finalProgress, currentSavedProgress);
      }
    },
    [initialProgress, sendProgressUpdate]
  );

  const initializeProgress = useCallback((savedProgress: number) => {
    setInitialProgress(savedProgress);
    setCurrentProgress(savedProgress);
    setLastProgressUpdate(savedProgress);
    hasInitializedProgress.current = true;
  }, []);

  useEffect(() => {
    return () => {
      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current);
      }
    };
  }, []);

  return {
    currentProgress,
    initialProgress,
    handleVideoProgress,
    handleVideoPause,
    initializeProgress,
    setCurrentProgress,
  };
};
