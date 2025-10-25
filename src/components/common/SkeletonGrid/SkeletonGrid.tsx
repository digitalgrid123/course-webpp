"use client";

import React from "react";

interface SkeletonGridProps {
  count?: number;
  className?: string;
  columns?: string;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({
  count = 8,
  className = "",
  columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
}) => {
  return (
    <div className={`grid ${columns} gap-6 mt-6 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-20 p-3 overflow-hidden shadow-orange-soft animate-pulse"
        >
          <div className="relative h-28 w-full rounded-20 bg-gray-200 mb-4" />
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-1" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
};
