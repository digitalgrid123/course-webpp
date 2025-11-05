// components/TabContent/TabContent.tsx
import React from "react";
import Image from "next/image";
import { DownloadCard } from "../DownloadCard/DownloadCard";
import { getFullUrl } from "@/utils/helper";
import { CourseDetail, Lesson, LessonMaterial, VideoData } from "@/types";

interface TabContentProps {
  activeTab: string;
  courseDetail: CourseDetail;
  selectedLesson: number | null;
  videoData: VideoData;
  onTabChange: (tab: string) => void;
}

export const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  courseDetail,
  selectedLesson,
  videoData,
  onTabChange,
}) => {
  const getCurrentLesson = (): Lesson | null => {
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

  const getFileTypeLabel = (fileType: number): string => {
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

  const currentLesson = getCurrentLesson();

  return (
    <div className="overflow-hidden">
      <div className="border-b-2 border-solid flex border-gray-200 justify-center">
        <button
          onClick={() => onTabChange("material")}
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
            onClick={() => onTabChange("join")}
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
          onClick={() => onTabChange("about")}
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
          <JoinTabContent videoData={videoData} />
        )}

        {activeTab === "about" && (
          <AboutTabContent
            courseDetail={courseDetail}
            currentLesson={currentLesson}
          />
        )}

        {activeTab === "material" && (
          <MaterialTabContent
            currentLesson={currentLesson}
            getFileTypeLabel={getFileTypeLabel}
          />
        )}
      </div>
    </div>
  );
};

// Props interface for JoinTabContent
interface JoinTabContentProps {
  videoData: VideoData;
}

const JoinTabContent: React.FC<JoinTabContentProps> = ({ videoData }) => {
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

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-6">
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
            className="flex items-center justify-center gap-3 bg-amber-gold hover:bg-amber-600 text-white font-medium text-base py-2.5 px-3.5 rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            כניסה לפגישה{" "}
          </a>
          {schedule && (
            <div className="border-slate-200 border border-solid rounded-xl py-2.5 px-3.5 flex items-center gap-2">
              <div>
                <p className="text-gray-700 font-medium">
                  {schedule.time} <span className="text-gray-500">•</span>{" "}
                  {schedule.date}
                </p>
              </div>

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
  );
};

// Props interface for AboutTabContent
interface AboutTabContentProps {
  courseDetail: CourseDetail;
  currentLesson: Lesson | null;
}

const AboutTabContent: React.FC<AboutTabContentProps> = ({
  courseDetail,
  currentLesson,
}) => (
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
);

// Props interface for MaterialTabContent
interface MaterialTabContentProps {
  currentLesson: Lesson | null;
  getFileTypeLabel: (type: number) => string;
}

const MaterialTabContent: React.FC<MaterialTabContentProps> = ({
  currentLesson,
  getFileTypeLabel,
}) => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold text-charcoal-blue mb-4">
      חומרי עזר לשיעור
    </h2>

    {currentLesson &&
    currentLesson.materials &&
    currentLesson.materials.length > 0 ? (
      <div className="grid gap-6 md:grid-cols-2">
        {currentLesson.materials.map((material: LessonMaterial) => (
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
        <p className="text-lg">אין חומרי עזר זמינים לשיעור זה</p>
        <p className="text-sm mt-2">בחר שיעור אחר מהתפריט</p>
      </div>
    )}
  </div>
);
