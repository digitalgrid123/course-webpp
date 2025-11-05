// components/ModuleList/ModuleList.tsx
import { CourseModule } from "@/types";
import React from "react";
import { ModuleHeader } from "../ModuleHeader/ModuleHeader";
import { LessonItem } from "./LessonItem";

interface ModuleListProps {
  modules: CourseModule[];
  selectedModule: number | null;
  selectedLesson: number | null;
  isMyCourse: boolean;
  onModuleClick: (moduleId: number) => void;
  onLessonClick: (
    lessonId: number,
    moduleIndex: number,
    lessonIndex: number
  ) => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({
  modules,
  selectedModule,
  selectedLesson,
  isMyCourse,
  onModuleClick,
  onLessonClick,
}) => {
  const isLessonAccessible = (moduleIndex: number, lessonIndex: number) => {
    return isMyCourse || (moduleIndex === 0 && lessonIndex === 0);
  };

  return (
    <div className="space-y-1">
      {modules.map((courseModule, moduleIndex) => {
        const isModuleAccessible = isMyCourse || moduleIndex === 0;

        return (
          <div key={courseModule.id}>
            <ModuleHeader
              module={courseModule}
              isSelected={selectedModule === courseModule.id}
              isAccessible={isModuleAccessible}
              onClick={() => onModuleClick(courseModule.id)}
            />

            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                selectedModule === courseModule.id
                  ? "max-h-[1000px] opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 -translate-y-2"
              }`}
            >
              <div className="bg-amber-gold p-4 rounded-lg mt-2 text-sm text-white/95">
                <p className="font-semibold mb-3 text-right">שיעורים:</p>
                <div className="space-y-2 relative">
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

                  {courseModule.lessons.map((lesson, lessonIndex) => {
                    const isAccessible = isLessonAccessible(
                      moduleIndex,
                      lessonIndex
                    );

                    return (
                      <LessonItem
                        key={lesson.id}
                        lesson={lesson}
                        isSelected={selectedLesson === lesson.id}
                        isAccessible={isAccessible}
                        onClick={() =>
                          onLessonClick(lesson.id, moduleIndex, lessonIndex)
                        }
                      />
                    );
                  })}
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
  );
};
