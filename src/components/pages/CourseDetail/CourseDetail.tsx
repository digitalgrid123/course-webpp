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

  const isLessonAccessible = useCallback(
    (moduleIndex: number, lessonIndex: number) => {
      if (courseDetail?.is_my_course === 1) {
        return true;
      }
      return moduleIndex === 0 && lessonIndex === 0;
    },
    [courseDetail]
  );

  useEffect(() => {
    if (selectedLesson && courseDetail) {
      hasInitializedProgress.current = false;
      const savedProgress = getCurrentLessonProgress();
      setInitialProgress(savedProgress);
      setCurrentProgress(savedProgress);
      setLastProgressUpdate(savedProgress);
      hasInitializedProgress.current = true;
    }
  }, [selectedLesson, courseDetail, getCurrentLessonProgress]);

  const sendProgressUpdate = useCallback(
    (lessonId: number, progressPercentage: number) => {
      if (!courseDetail) return;

      const currentSavedProgress = getCurrentLessonProgress();

      if (progressPercentage <= currentSavedProgress) {
        return;
      }

      if (currentSavedProgress >= 100) {
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
    const moduleIndex =
      courseDetail?.modules.findIndex((m) => m.id === moduleId) || 0;

    if (courseDetail?.is_my_course === 0 && moduleIndex > 0) {
      toast.error("יש לרכוש את הקורס כדי לגשת למודולים נוספים");
      return;
    }

    setSelectedModule(selectedModule === moduleId ? null : moduleId);
  };

  const handleLessonClick = (
    lessonId: number,
    moduleIndex: number,
    lessonIndex: number
  ) => {
    if (!isLessonAccessible(moduleIndex, lessonIndex)) {
      toast.error("יש לרכוש את הקורס כדי לגשת לשיעור זה");
      return;
    }

    if (selectedLesson && currentProgress > initialProgress) {
      sendProgressUpdate(selectedLesson, currentProgress);
    }

    setSelectedLesson(lessonId);

    const savedProgress =
      courseDetail?.modules
        ?.flatMap((m) => m.lessons)
        ?.find((l) => l.id === lessonId)?.watched_progress || 0;
    setCurrentProgress(savedProgress);
    setInitialProgress(savedProgress);
    setLastProgressUpdate(savedProgress);

    hasInitializedProgress.current = false;
  };

  const debouncedProgressUpdate = useCallback(
    (lessonId: number, progressPercentage: number) => {
      const currentSavedProgress = getCurrentLessonProgress();

      if (currentSavedProgress >= 100) {
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
      if (!selectedLesson || !hasInitializedProgress.current) {
        return;
      }

      const currentSavedProgress = getCurrentLessonProgress();

      if (currentSavedProgress >= 100) {
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
        sendProgressUpdate(selectedLesson, finalProgress);
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
        lessonType: null,
        meetingLink: null,
        scheduleDateTime: null,
        details: courseDetail?.details || null,
      };
    }

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

  const formatScheduleDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString) return null;

    const date = new Date(dateTimeString);
    const formattedDate = date.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    return { date: formattedDate, time: formattedTime };
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
          <div className="text-xl text-gray-500">
            לא נמצאו נתונים עבור הקורס
          </div>
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

  const videoData = getVideoData();
  console.log("🚀 ~ CourseDetail ~ videoData:", videoData);
  const currentLesson = getCurrentLesson();

  const handleBackNavigation = () => {
    if (selectedLesson && currentProgress > initialProgress) {
      sendProgressUpdate(selectedLesson, currentProgress);
    }
    router.back();
  };

  return (
    <div className="min-h-screen bg-white px-8 py-8" dir="rtl">
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
                      <div className="flex items-center gap-2.5 justify-center">
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
                    <div className="h-full max-h-64 overflow-y-auto text-xs text-white text-center space-y-3 custom-scrollbar">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: courseDetail.teacher.bio,
                        }}
                      ></div>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: courseDetail.teacher.detail,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-linear-(--gradient-amber) rounded-2xl p-8 text-white">
                <h2 className="text-center font-bold text-base mb-3">
                  {courseDetail.modules_count} מודולים
                </h2>

                <div className="mb-6 bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">התקדמות כוללת</span>
                    <span className="text-lg font-bold">
                      {Math.round(
                        courseDetail.modules.reduce((total, module) => {
                          const moduleProgress = module.lessons.reduce(
                            (sum, lesson) =>
                              sum + (lesson.watched_progress || 0),
                            0
                          );
                          return total + moduleProgress;
                        }, 0) /
                          courseDetail.modules.reduce(
                            (total, module) => total + module.lessons.length,
                            0
                          )
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-white h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(
                          courseDetail.modules.reduce((total, module) => {
                            const moduleProgress = module.lessons.reduce(
                              (sum, lesson) =>
                                sum + (lesson.watched_progress || 0),
                              0
                            );
                            return total + moduleProgress;
                          }, 0) /
                            courseDetail.modules.reduce(
                              (total, module) => total + module.lessons.length,
                              0
                            )
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-1 ">
                  {courseDetail.modules.map((courseModule, moduleIndex) => {
                    const isModuleAccessible =
                      courseDetail.is_my_course === 1 || moduleIndex === 0;

                    return (
                      <div key={courseModule.id}>
                        <div
                          onClick={() => handleModuleClick(courseModule.id)}
                          className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                            !isModuleAccessible
                              ? "opacity-50 cursor-not-allowed bg-white/5"
                              : selectedModule === courseModule.id
                              ? "bg-amber-gold cursor-pointer"
                              : "hover:bg-amber-gold cursor-pointer"
                          }`}
                        >
                          <div className="w-8 h-8 bg-soft-gray shadow-soft-dark rounded-lg flex items-center justify-center text-charcoal-blue font-bold text-sm flex-shrink-0">
                            {courseModule.sorting_order}
                          </div>
                          <span className="text-white font-medium text-sm flex-1 text-right mr-4 flex items-center gap-2">
                            {courseModule.name}
                            {!isModuleAccessible && (
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
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
                            <div className="space-y-2 relative">
                              <div className="absolute right-3.5 top-0 bottom-0 w-0.5 bg-white/30"></div>
                              <div
                                className="absolute right-3.5 top-0 w-0.5 bg-green-400 transition-all duration-500"
                                style={{
                                  height: `${
                                    (courseModule.lessons.filter(
                                      (l) => l.watched_progress >= 100
                                    ).length /
                                      courseModule.lessons.length) *
                                    100
                                  }%`,
                                }}
                              ></div>

                              {courseModule.lessons.map(
                                (lesson, lessonIndex) => {
                                  const moduleIndex =
                                    courseDetail.modules.findIndex(
                                      (m) => m.id === courseModule.id
                                    );
                                  const isAccessible = isLessonAccessible(
                                    moduleIndex,
                                    lessonIndex
                                  );

                                  return (
                                    <div
                                      key={lesson.id}
                                      onClick={() =>
                                        isAccessible &&
                                        handleLessonClick(
                                          lesson.id,
                                          moduleIndex,
                                          lessonIndex
                                        )
                                      }
                                      className={`flex items-center justify-between p-3 rounded-lg transition-all relative ${
                                        !isAccessible
                                          ? "opacity-50 cursor-not-allowed bg-white/5"
                                          : selectedLesson === lesson.id
                                          ? "bg-white/20 ring-2 ring-white/50 cursor-pointer"
                                          : "hover:bg-white/10 cursor-pointer"
                                      }`}
                                    >
                                      <div
                                        className={`absolute right-[10px] w-2 h-2 rounded-full ${
                                          lesson.watched_progress >= 100
                                            ? "bg-green-400"
                                            : "bg-white/50"
                                        }`}
                                      ></div>

                                      <span className="text-right flex-1 mr-3 relative">
                                        {lesson.name}
                                      </span>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                            <p className="mt-3 text-xs text-white/70 text-right">
                              לחץ שוב כדי להסתיר
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {courseDetail?.is_my_course === 0 && (
                  <button
                    onClick={handleCartAction}
                    className={`w-full py-3 px-4 rounded-10 transition-all font-semibold text-sm mt-6 ${
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
                      `מחיר הקורס המלא:  ₪${courseDetail.price}`
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {/* Type 3: Meeting Link Display */}
            {videoData.lessonType === 3 && videoData.meetingLink ? (
              <div className="bg-white rounded-4xl shadow-md overflow-hidden">
                <div className="bg-gray-900 aspect-video relative rounded-4xl flex items-center justify-center">
                  {videoData.thumbnail && (
                    <Image
                      src={getFullUrl(videoData.thumbnail)}
                      alt={videoData.lessonName || courseDetail.name}
                      fill
                      style={{ objectFit: "cover" }}
                      className="opacity-60"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

                  <div className="relative z-10 text-center text-white px-8">
                    <svg
                      className="w-20 h-20 mx-auto mb-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    <h3 className="text-2xl font-bold mb-4">
                      שיעור זום/גוגל מיט
                    </h3>
                    {videoData.scheduleDateTime && (
                      <div className="mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        {(() => {
                          const schedule = formatScheduleDateTime(
                            videoData.scheduleDateTime
                          );
                          return schedule ? (
                            <>
                              <p className="text-sm mb-2">תאריך ושעה:</p>
                              <p className="text-xl font-bold">
                                {schedule.date} בשעה {schedule.time}
                              </p>
                            </>
                          ) : null;
                        })()}
                      </div>
                    )}
                    <a
                      href={videoData.meetingLink}
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
            ) : videoData.isYouTube && videoData.videoId ? (
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
                      <p className="text-lg">אין וידאו זמין</p>
                      <p className="text-sm text-gray-400 mt-2">
                        בחר שיעור מהתפריט
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

                {videoData.lessonType === 3 && (
                  <button
                    onClick={() => setActiveTab("join")}
                    className={`px-6 py-4 transition-all relative ${
                      activeTab === "join"
                        ? "text-charcoal-blue font-bold"
                        : "text-gray-400 hover:text-charcoal-blue hover:bg-gray-50"
                    }`}
                  >
                    שיעורי זום{" "}
                    {activeTab === "join" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-blue"></div>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("about")}
                  className={`px-6 py-4 transition-all relative ${
                    activeTab === "about"
                      ? "text-charcoal-blue font-bold"
                      : "text-gray-400 hover:text-charcoal-blue hover:bg-gray-50"
                  }`}
                >
                  על הקורס{" "}
                  {activeTab === "about" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-charcoal-blue"></div>
                  )}
                </button>
              </div>

              <div className="p-6">
                {activeTab === "join" && videoData.lessonType === 3 && (
                  <div className="space-y-6">
                    <div className=" rounded-xl p-6 ">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="flex-1">
                          <h3 className="text-xl font-medium text-charcoal-blue mb-2">
                            {videoData.lessonName}
                          </h3>
                          {videoData.details && (
                            <p
                              className="text-sm text-charcoal-blue"
                              dangerouslySetInnerHTML={{
                                __html: videoData.details,
                              }}
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <a
                          href={videoData.meetingLink || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-3  bg-amber-gold hover:bg-amber-600 text-white font-medium text-base py-2.5 px-3.5 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                        >
                          כניסה לפגישה{" "}
                        </a>
                        {videoData.scheduleDateTime && (
                          <div className="border-slate-200 border border-solid rounded-xl py-2.5 px-3.5 flex items-center gap-2">
                            {(() => {
                              const schedule = formatScheduleDateTime(
                                videoData.scheduleDateTime
                              );
                              return schedule ? (
                                <div>
                                  <p className="text-gray-700 font-medium">
                                    {schedule.time}{" "}
                                    <span className="text-gray-500">•</span>{" "}
                                    {schedule.date}
                                  </p>
                                </div>
                              ) : null;
                            })()}

                            <div className="w-5 h-5 relative shrink-0">
                              <Image
                                src="/assets/images/icons/CalendarDots.svg"
                                alt="Lesson Thumbnail"
                                fill
                                className="object-cover rounded-lg"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
