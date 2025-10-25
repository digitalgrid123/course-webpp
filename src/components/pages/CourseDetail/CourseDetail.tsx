"use client";
import Breadcrumb from "@/components/common/Breadcrumb/Breadcrumb";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { DownloadCard } from "./components/DownloadCard/DownloadCard";
import { VideoPlayer } from "./components/VideoPlayer/VideoPlayer";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchCourseDetail,
  clearCourseDetail,
  updateLessonProgress,
  updateLocalProgress,
} from "@/store/slices/courseSlice";
import { YouTubePlayer } from "./components/VideoPlayer/YouTubePlayer";
import { addToCart, removeFromCart } from "@/store/slices/cartSlice";
import CourseDetailLoading from "@/components/common/loading/CourseDetailLoading";
import { getFullUrl } from "@/utils/helper";
import toast from "react-hot-toast";

interface CourseDetailProps {
  id: string;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ id }) => {
  const [activeTab, setActiveTab] = useState("about");
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [lastProgressUpdate, setLastProgressUpdate] = useState<number>(0);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [initialProgress, setInitialProgress] = useState<number>(0);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const progressUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitializedProgress = useRef<boolean>(false);

  const { courseDetail, detailLoading, error } = useSelector(
    (state: RootState) => state.course
  );

  const { items: cartItems } = useSelector((state: RootState) => state.cart);

  const isInCart = cartItems.some((item) => item.id === courseDetail?.id);

  const getCurrentLessonProgress = useCallback(() => {
    if (!courseDetail?.modules || !selectedLesson) return 0;

    for (const courseModule of courseDetail.modules) {
      const lesson = courseModule.lessons?.find((l) => l.id === selectedLesson);
      if (lesson) {
        return lesson.watched_progress || 0;
      }
    }
    return 0;
  }, [courseDetail, selectedLesson]);

  useEffect(() => {
    if (selectedLesson && courseDetail) {
      const savedProgress = getCurrentLessonProgress();
      setInitialProgress(savedProgress);
      setCurrentProgress(savedProgress);
      setLastProgressUpdate(savedProgress);
      hasInitializedProgress.current = true;

      console.log("Initialized lesson progress:", {
        lessonId: selectedLesson,
        savedProgress,
        timestamp: new Date().toISOString(),
      });
    }
  }, [selectedLesson, courseDetail, getCurrentLessonProgress]);

  const sendProgressUpdate = useCallback(
    (lessonId: number, progressPercentage: number) => {
      if (!courseDetail) return;

      const currentSavedProgress = getCurrentLessonProgress();

      if (progressPercentage <= currentSavedProgress) {
        console.log("Progress not greater than saved, skipping update:", {
          current: progressPercentage,
          saved: currentSavedProgress,
        });
        return;
      }

      if (currentSavedProgress >= 100) {
        console.log("Lesson already completed, skipping progress update");
        return;
      }

      if (lessonId && progressPercentage > 0) {
        dispatch(
          updateLocalProgress({
            lessonId,
            progress: progressPercentage,
            courseId: courseDetail.id,
          })
        );

        dispatch(
          updateLessonProgress({
            lesson_id: lessonId,
            progress: progressPercentage,
            courseId: courseDetail.id,
          })
        );

        console.log("Progress saved:", {
          lessonId,
          progress: progressPercentage,
          previousProgress: currentSavedProgress,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [dispatch, getCurrentLessonProgress, courseDetail]
  );

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (selectedLesson && currentProgress > initialProgress) {
        sendProgressUpdate(selectedLesson, currentProgress);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [selectedLesson, currentProgress, initialProgress, sendProgressUpdate]);

  useEffect(() => {
    return () => {
      if (selectedLesson && currentProgress > initialProgress) {
        sendProgressUpdate(selectedLesson, currentProgress);
      }
      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current);
      }
    };
  }, [selectedLesson, currentProgress, initialProgress, sendProgressUpdate]);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseDetail({ course_id: parseInt(id) }));
    }

    return () => {
      dispatch(clearCourseDetail());
      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current);
      }
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (
      courseDetail?.modules &&
      courseDetail.modules.length > 0 &&
      selectedLesson === null
    ) {
      const firstModule = courseDetail.modules[0];
      setSelectedModule(firstModule.id);

      if (firstModule.lessons && firstModule.lessons.length > 0) {
        setSelectedLesson(firstModule.lessons[0].id);
      }
    }
  }, [courseDetail, selectedLesson]);

  const handleModuleClick = (moduleId: number) => {
    setSelectedModule(selectedModule === moduleId ? null : moduleId);
  };

  const handleLessonClick = (lessonId: number) => {
    if (selectedLesson && currentProgress > initialProgress) {
      sendProgressUpdate(selectedLesson, currentProgress);
    }

    setSelectedLesson(lessonId);
    hasInitializedProgress.current = false;
  };

  const debouncedProgressUpdate = useCallback(
    (lessonId: number, progressPercentage: number) => {
      const currentSavedProgress = getCurrentLessonProgress();

      if (currentSavedProgress >= 100) {
        console.log("Lesson already completed, skipping debounced update");
        return;
      }

      if (progressPercentage <= currentSavedProgress) {
        return;
      }

      if (progressUpdateRef.current) {
        clearTimeout(progressUpdateRef.current);
      }

      progressUpdateRef.current = setTimeout(() => {
        sendProgressUpdate(lessonId, progressPercentage);
      }, 2000);
    },
    [sendProgressUpdate, getCurrentLessonProgress]
  );

  const handleVideoProgress = useCallback(
    (data: { played: number; currentTime: number; duration: number }) => {
      if (!selectedLesson || !hasInitializedProgress.current) return;

      const currentSavedProgress = getCurrentLessonProgress();

      if (currentSavedProgress >= 100) {
        console.log("Lesson already at 100%, skipping progress tracking");
        return;
      }

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
        debouncedProgressUpdate(selectedLesson, finalProgress);

        console.log("Video Progress Update:", {
          lessonId: selectedLesson,
          progress: finalProgress,
          savedProgress: currentSavedProgress,
          currentTime: Math.floor(data.currentTime),
          duration: Math.floor(data.duration),
          timestamp: new Date().toISOString(),
        });

        if (finalProgress >= 95) {
          console.log("✅ Video completed! Lesson marked as done.");
        }
      }
    },
    [
      selectedLesson,
      lastProgressUpdate,
      initialProgress,
      debouncedProgressUpdate,
      getCurrentLessonProgress,
    ]
  );

  const handleVideoPause = useCallback(
    (data: { played: number; currentTime: number; duration: number }) => {
      if (!selectedLesson || !hasInitializedProgress.current) return;

      const currentSavedProgress = getCurrentLessonProgress();

      if (currentSavedProgress >= 100) {
        console.log("Lesson already at 100%, skipping pause progress update");
        return;
      }

      const progressPercentage = Math.floor(data.played * 100);

      const finalProgress = Math.max(
        progressPercentage,
        currentSavedProgress,
        initialProgress
      );
      setCurrentProgress(finalProgress);

      if (finalProgress > currentSavedProgress) {
        sendProgressUpdate(selectedLesson, finalProgress);

        console.log("Video Paused - Progress Saved:", {
          lessonId: selectedLesson,
          progress: finalProgress,
          previousProgress: currentSavedProgress,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [
      selectedLesson,
      initialProgress,
      sendProgressUpdate,
      getCurrentLessonProgress,
    ]
  );

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

  const handleCartAction = () => {
    if (!courseDetail) return;

    if (isInCart) {
      dispatch(removeFromCart(courseDetail.id));
      toast.success("הקורס הוסר מהעגלה בהצלחה");
    } else {
      dispatch(
        addToCart({
          id: courseDetail.id,
          name: courseDetail.name,
          price: parseFloat(courseDetail.price),
          price_type: courseDetail.price_type,
          image: courseDetail.image,
          teacher: {
            name: courseDetail.teacher.name,
            image: courseDetail.teacher.image,
          },
          modules_count: courseDetail.modules_count,
          addedAt: new Date().toISOString(),
        })
      );
      toast.success("הקורס נוסף לעגלה בהצלחה");
    }
  };

  const getCurrentLesson = () => {
    if (!courseDetail?.modules || !selectedLesson) return null;

    for (const courseModule of courseDetail.modules) {
      if (courseModule.lessons && courseModule.lessons.length > 0) {
        for (const lesson of courseModule.lessons) {
          if (lesson.id === selectedLesson) {
            return lesson;
          }
        }
      }
    }
    return null;
  };

  const getVideoData = () => {
    const currentLesson = getCurrentLesson();

    if (!currentLesson) {
      return {
        url: null,
        videoId: null,
        isYouTube: false,
        thumbnail: courseDetail?.image || null,
        lessonName: null,
      };
    }

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
    };
  };

  const getFileTypeLabel = (fileType: number) => {
    switch (fileType) {
      case 1:
        return "PDF";
      case 2:
        return "קישור";
      case 3:
        return "מסמך";
      default:
        return "קובץ";
    }
  };

  if (detailLoading) {
    return <CourseDetailLoading />;
  }

  if (error) {
    return (
      <div
        className="min-h-screen bg-white px-8 py-8 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-xl text-red-500 mb-2">שגיאה בטעינת הקורס</div>
          <div className="text-gray-600">{error}</div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-charcoal-blue text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            חזור אחורה
          </button>
        </div>
      </div>
    );
  }

  if (!courseDetail) {
    return (
      <div className="min-h-screen bg-white px-8 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <div className="text-xl text-gray-500">No course data found</div>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-charcoal-blue text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const videoData = getVideoData();
  const currentLesson = getCurrentLesson();

  const handleBackNavigation = () => {
    if (selectedLesson && currentProgress > initialProgress) {
      sendProgressUpdate(selectedLesson, currentProgress);
    }
    router.back();
  };

  return (
    <div className="min-h-screen bg-white px-8 py-8" dir="">
      <Breadcrumb
        items={[
          { label: "ראשי" },
          { label: courseDetail.teacher.name },
          { label: courseDetail.name },
          { label: "קורסים" },
        ]}
        onBack={handleBackNavigation}
      />

      <div className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-first lg:order-last">
            <div className="sticky top-8">
              <div className="bg-linear-(--gradient-amber) rounded-2xl p-8 text-white mb-6">
                <div className="flex flex-col items-center">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h1 className="text-lg font-bold text-center mb-2.5">
                        {courseDetail.name}
                      </h1>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-4 overflow-hidden relative">
                          <Image
                            src={
                              getFullUrl(courseDetail.teacher.image) ||
                              "/assets/images/icons/instructor.svg"
                            }
                            alt="instructor"
                            fill
                          />
                        </div>
                        <p className="text-sm text-white">
                          שם המרצה: {courseDetail.teacher.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div dir="rtl">
                    <h3 className="font-bold text-sm mb-3 text-right">
                      קורות חיים:
                    </h3>
                    <ul className="list-disc pr-5 space-y-2 text-xs text-white/95 text-right">
                      <li>{courseDetail.teacher.bio}</li>
                      <li>{courseDetail.teacher.detail}</li>
                      <li>מספר קורסים: {courseDetail.teacher.courses_count}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-linear-(--gradient-amber) rounded-2xl p-8 text-white">
                <h2 className="text-center font-bold text-base mb-6">
                  {courseDetail.modules_count} מודולים
                </h2>

                <div className="space-y-1 mb-6">
                  {courseDetail.modules.map((courseModule) => (
                    <div key={courseModule.id}>
                      <div
                        onClick={() => handleModuleClick(courseModule.id)}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer ${
                          selectedModule === courseModule.id
                            ? "bg-amber-gold"
                            : "hover:bg-amber-gold"
                        }`}
                      >
                        <div className="w-8 h-8 bg-soft-gray shadow-soft-dark rounded-lg flex items-center justify-center text-charcoal-blue font-bold text-sm flex-shrink-0">
                          {courseModule.sorting_order}
                        </div>
                        <span className="text-white font-medium text-sm flex-1 text-right mr-4">
                          {courseModule.name}
                        </span>
                      </div>

                      <div
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                          selectedModule === courseModule.id
                            ? "max-h-[1000px] opacity-100 translate-y-0"
                            : "max-h-0 opacity-0 -translate-y-2"
                        }`}
                      >
                        <div className="bg-amber-gold p-4 rounded-lg mt-2 text-sm text-white/95">
                          <p className="font-semibold mb-3 text-right">
                            שיעורים:
                          </p>
                          <div className="space-y-2">
                            {courseModule.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                onClick={() => handleLessonClick(lesson.id)}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                                  selectedLesson === lesson.id
                                    ? "bg-white/20 ring-2 ring-white/50"
                                    : "hover:bg-white/10"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-white text-charcoal-blue px-2 py-1 rounded font-semibold">
                                    {lesson.type === 1 ? "סרטון" : "קישור"}
                                  </span>
                                  {lesson.materials &&
                                    lesson.materials.length > 0 && (
                                      <span className="text-xs bg-white/30 text-white px-2 py-1 rounded font-semibold">
                                        {lesson.materials.length} חומרים
                                      </span>
                                    )}
                                  {lesson.watched_progress >= 100 && (
                                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded font-semibold flex items-center gap-1">
                                      <svg
                                        className="w-3 h-3"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      הושלם
                                    </span>
                                  )}
                                  {lesson.watched_progress > 0 &&
                                    lesson.watched_progress < 100 && (
                                      <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded font-semibold">
                                        {lesson.watched_progress}%
                                      </span>
                                    )}
                                </div>
                                <span className="text-right flex-1 mr-3">
                                  {lesson.name}
                                </span>
                              </div>
                            ))}
                          </div>
                          <p className="mt-3 text-xs text-white/70 text-right">
                            לחץ שוב כדי להסתיר
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleCartAction}
                  className={`w-full py-3 px-4 rounded-10 transition-all font-semibold text-sm ${
                    isInCart
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                >
                  {isInCart ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      נוסף לעגלה
                    </span>
                  ) : (
                    `מחיר הקורס המלא: ${courseDetail.price_type} ${courseDetail.price}`
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {videoData.isYouTube && videoData.videoId ? (
              <YouTubePlayer
                videoId={videoData.videoId}
                onProgress={handleVideoProgress}
                onPause={handleVideoPause}
                initialProgress={initialProgress}
              />
            ) : videoData.url ? (
              <VideoPlayer
                videoUrl={videoData.url}
                thumbnail={videoData.thumbnail}
                onProgress={handleVideoProgress}
                onPause={handleVideoPause}
                initialProgress={initialProgress}
              />
            ) : (
              <div className="bg-white rounded-4xl shadow-md overflow-hidden">
                <div className="bg-gray-900 aspect-video relative rounded-4xl flex items-center justify-center">
                  {videoData.thumbnail ? (
                    <Image
                      src={getFullUrl(videoData.thumbnail)}
                      alt={courseDetail.name}
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
                      <p className="text-lg">No video available</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Select a lesson from the sidebar
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="p-6">
              <h1 className="text-3xl font-bold text-charcoal-blue mb-5 text-center">
                {videoData.lessonName || courseDetail.name}
              </h1>
              <div className="flex items-center justify-between gap-4 text-charcoal-blue text-sm">
                <div className="flex items-center gap-2">
                  מרצה: {courseDetail.teacher.name}
                </div>

                <div className="flex items-center gap-2">
                  {courseDetail.modules_count} מודולים
                  <Image
                    src={"/assets/images/icons/module.svg"}
                    width={16}
                    height={16}
                    alt="module"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <div className="border-b-2 border-solid flex border-gray-200 justify-center">
                <button
                  onClick={() => setActiveTab("material")}
                  className={`px-6 py-4 transition-all relative ${
                    activeTab === "material"
                      ? "text-charcoal-blue font-bold"
                      : "text-gray-400 hover:text-charcoal-blue hover:bg-gray-50"
                  }`}
                >
                  חומרי עזר
                  {activeTab === "material" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-blue"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("about")}
                  className={`px-6 py-4 transition-all relative ${
                    activeTab === "about"
                      ? "text-charcoal-blue font-bold"
                      : "text-gray-400 hover:text-charcoal-blue hover:bg-gray-50"
                  }`}
                >
                  על השיעור
                  {activeTab === "about" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-blue"></div>
                  )}
                </button>
              </div>

              <div className="p-6">
                {activeTab === "about" && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-charcoal-blue mb-2">
                      {currentLesson ? `על ${currentLesson.name}` : "על הקורס"}
                    </h2>

                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: currentLesson?.details || courseDetail.details,
                      }}
                    />
                  </div>
                )}
                {activeTab === "material" && (
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-charcoal-blue mb-4">
                      חומרי עזר לשיעור
                    </h2>

                    {currentLesson &&
                    currentLesson.materials &&
                    currentLesson.materials.length > 0 ? (
                      <div className="grid gap-6 md:grid-cols-2">
                        {currentLesson.materials.map((material) => (
                          <DownloadCard
                            key={material.id}
                            title={material.title}
                            subtitle={getFileTypeLabel(material.file_type)}
                            downloadUrl={getFullUrl(material.file)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <svg
                          className="w-16 h-16 mx-auto mb-4 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p className="text-lg">
                          אין חומרי עזר זמינים לשיעור זה
                        </p>
                        <p className="text-sm mt-2">בחר שיעור אחר מהתפריט</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
