// components/ModuleList/LessonItem.tsx
import { Lesson } from "@/types";
import React from "react";

interface LessonItemProps {
  lesson: Lesson;
  isSelected: boolean;
  isAccessible: boolean;
  onClick: () => void;
}

export const LessonItem: React.FC<LessonItemProps> = ({
  lesson,
  isSelected,
  isAccessible,
  onClick,
}) => {
  return (
    <div
      onClick={isAccessible ? onClick : undefined}
      className={`flex items-center justify-between p-3 rounded-lg transition-all relative ${
        !isAccessible
          ? "opacity-50 cursor-not-allowed bg-white/5"
          : isSelected
          ? "bg-white/20 ring-2 ring-white/50 cursor-pointer"
          : "hover:bg-white/10 cursor-pointer"
      }`}
    >
      <div
        className={`absolute right-2.5 w-2 h-2 rounded-full ${
          lesson.watched_progress > 100 ? "bg-green-400" : "bg-white/50"
        }`}
      ></div>

      <span className="text-right flex-1 mr-3 relative">{lesson.name}</span>
    </div>
  );
};
