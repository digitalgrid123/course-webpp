"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchCourseDetail,
  clearCourseDetail,
} from "@/store/slices/courseSlice";
import { addToCart, removeFromCart } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";

import Breadcrumb from "@/components/common/Breadcrumb/Breadcrumb";
import CourseDetailLoading from "@/components/common/loading/CourseDetailLoading";
import { VideoContent } from "./components/VideoContent/VideoContent";
import { useCourseProgress } from "../../../../hooks/useCourseProgress";
import { useVideoData } from "../../../../hooks/useVideoData";
import { CourseSidebar } from "./components/CourseSidebar/CourseSidebar";
import { CourseHeader } from "./components/CourseHeader/CourseHeader";
import { TabContent } from "./components/TabContent/TabContent";
import { PurchaseBottomSheet } from "./components/PurchaseBottomSheet/PurchaseBottomSheet";

interface CourseDetailProps {
  id: string;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ id }) => {
  const [activeTab, setActiveTab] = useState("about");
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { courseDetail, detailLoading, error } = useSelector(
    (state: RootState) => state.course
  );
  const { items: cartItems } = useSelector((state: RootState) => state.cart);

  const {
    currentProgress,
    initialProgress,
    handleVideoProgress,
    handleVideoPause,
    initializeProgress,
    setCurrentProgress,
  } = useCourseProgress(courseDetail?.id);

  const videoData = useVideoData(courseDetail, selectedLesson);
  const isInCart = cartItems.some((item) => item.id === courseDetail?.id);

  // Initialize course data
  useEffect(() => {
    if (id) {
      dispatch(fetchCourseDetail({ course_id: parseInt(id) }));
    }
    return () => {
      dispatch(clearCourseDetail());
    };
  }, [id, dispatch]);

  // Auto-select first module and lesson
  useEffect(() => {
    if (courseDetail?.modules?.length && selectedLesson === null) {
      const firstModule = courseDetail.modules[0];
      setSelectedModule(firstModule.id);
      if (firstModule.lessons?.length) {
        setSelectedLesson(firstModule.lessons[0].id);
      }
    }
  }, [courseDetail, selectedLesson]);

  // Initialize progress when lesson changes
  useEffect(() => {
    if (selectedLesson && courseDetail) {
      const savedProgress = getCurrentLessonProgress();
      initializeProgress(savedProgress);
    }
  }, [selectedLesson, courseDetail, initializeProgress]);

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

  const handleModuleClick = (moduleId: number) => {
    const moduleIndex =
      courseDetail?.modules.findIndex((m) => m.id === moduleId) || 0;
    const selectedModuleData = courseDetail?.modules.find(
      (m) => m.id === moduleId
    );

    if (courseDetail?.is_my_course === 0 && moduleIndex > 0) {
      toast.error("יש לרכוש את הקורס כדי לגשת למודולים נוספים");
      return;
    }

    if (selectedModule === moduleId) {
      setSelectedModule(null);
      return;
    }

    setSelectedModule(moduleId);

    if (
      selectedModuleData?.lessons?.length &&
      courseDetail?.is_my_course === 1
    ) {
      const firstLesson = selectedModuleData.lessons[0];

      // Save current progress before switching
      if (selectedLesson && currentProgress > initialProgress) {
        handleProgressSave(selectedLesson, currentProgress);
      }

      setSelectedLesson(firstLesson.id);
      const savedProgress = firstLesson.watched_progress || 0;
      setCurrentProgress(savedProgress);
      initializeProgress(savedProgress);
    }
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
      handleProgressSave(selectedLesson, currentProgress);
    }

    setSelectedLesson(lessonId);
    const savedProgress = getLessonProgress(lessonId) || 0;
    setCurrentProgress(savedProgress);
    initializeProgress(savedProgress);
  };

  const handleProgressSave = (lessonId: number, progress: number) => {
    const currentSavedProgress = getCurrentLessonProgress();
    if (progress > currentSavedProgress && currentSavedProgress < 100) {
      // Implementation depends on your progress update logic
    }
  };

  const getLessonProgress = (lessonId: number) => {
    return (
      courseDetail?.modules
        ?.flatMap((m) => m.lessons)
        ?.find((l) => l.id === lessonId)?.watched_progress || 0
    );
  };

  const isLessonAccessible = (moduleIndex: number, lessonIndex: number) => {
    return (
      courseDetail?.is_my_course === 1 ||
      (moduleIndex === 0 && lessonIndex === 0)
    );
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

  const handleBackNavigation = () => {
    if (selectedLesson && currentProgress > initialProgress) {
      handleProgressSave(selectedLesson, currentProgress);
    }
    router.back();
  };

  if (detailLoading) return <CourseDetailLoading />;
  if (error) return <ErrorState error={error} onBack={handleBackNavigation} />;
  if (!courseDetail) return <NoDataState onBack={handleBackNavigation} />;

  return (
    <div
      className="min-h-screen bg-white px-4 sm:px-6 md:px-8 lg:px-12 pt-6 pb-32 sm:pb-0 sm:py-8 md:py-10"
      dir="rtl"
    >
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
          {/* Sidebar */}
          <div className="lg:col-span-1 order-last lg:order-last">
            <CourseSidebar
              courseDetail={courseDetail}
              selectedModule={selectedModule}
              selectedLesson={selectedLesson}
              isInCart={isInCart}
              onModuleClick={handleModuleClick}
              onLessonClick={handleLessonClick}
              onCartAction={handleCartAction}
              onBottomSheetOpen={() => setIsBottomSheetOpen(true)}
            />
          </div>

          <h1 className="text-3xl font-bold text-charcoal-blue mb-5 text-right sm:hidden block">
            {videoData.lessonName || courseDetail.name}
          </h1>

          <div className="lg:col-span-3 space-y-6">
            <VideoContent
              videoData={videoData}
              onProgress={(data) =>
                handleVideoProgress(
                  data,
                  selectedLesson,
                  getCurrentLessonProgress()
                )
              }
              onPause={(data) =>
                handleVideoPause(
                  data,
                  selectedLesson,
                  getCurrentLessonProgress()
                )
              }
              initialProgress={initialProgress}
            />

            <CourseHeader
              courseDetail={courseDetail}
              lessonName={videoData.lessonName}
            />
            <TabContent
              activeTab={activeTab}
              courseDetail={courseDetail}
              selectedLesson={selectedLesson}
              videoData={videoData}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      </div>

      <PurchaseBottomSheet
        isOpen={isBottomSheetOpen}
        courseDetail={courseDetail}
        selectedModule={selectedModule}
        selectedLesson={selectedLesson}
        isInCart={isInCart}
        onClose={() => setIsBottomSheetOpen(false)}
        onModuleClick={handleModuleClick}
        onLessonClick={handleLessonClick}
        onCartAction={handleCartAction}
      />
    </div>
  );
};

// Additional small components for error states
const ErrorState: React.FC<{ error: string; onBack: () => void }> = ({
  error,
  onBack,
}) => (
  <div
    className="min-h-screen bg-white px-8 py-8 flex items-center justify-center"
    dir="rtl"
  >
    <div className="text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <div className="text-xl text-red-500 mb-2">שגיאה בטעינת הקורס</div>
      <div className="text-gray-600">{error}</div>
      <button
        onClick={onBack}
        className="mt-4 px-6 py-2 bg-charcoal-blue text-white rounded-lg hover:bg-opacity-90 transition-all"
      >
        חזור אחורה
      </button>
    </div>
  </div>
);

const NoDataState: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="min-h-screen bg-white px-8 py-8 flex items-center justify-center">
    <div className="text-center">
      <div className="text-6xl mb-4">📚</div>
      <div className="text-xl text-gray-500">לא נמצאו נתונים עבור הקורס</div>
      <button
        onClick={onBack}
        className="mt-4 px-6 py-2 bg-charcoal-blue text-white rounded-lg hover:bg-opacity-90 transition-all"
      >
        חזור אחורה
      </button>
    </div>
  </div>
);

export default CourseDetail;
