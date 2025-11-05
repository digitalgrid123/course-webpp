// components/ProgressTracker/ProgressTracker.tsx
import { CourseModule } from "@/types";
import React from "react";

interface ProgressTrackerProps {
  modules: CourseModule[];
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  modules,
}) => {
  const totalProgress = modules.reduce((total, module) => {
    const moduleProgress = module.lessons.reduce(
      (sum, lesson) => sum + (lesson.watched_progress || 0),
      0
    );
    return total + moduleProgress;
  }, 0);

  const totalLessons = modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  const progress = totalLessons ? Math.round(totalProgress / totalLessons) : 0;

  return (
    <div className="mb-6 bg-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">התקדמות כוללת</span>
        <span className="text-lg font-bold">
          {isNaN(progress) ? 0 : progress}%
        </span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-white h-full rounded-full transition-all duration-500"
          style={{ width: `${isNaN(progress) ? 0 : progress}%` }}
        ></div>
      </div>
    </div>
  );
};
