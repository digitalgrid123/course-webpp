"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getFullUrl } from "@/utils/helper";

interface CourseCardProps {
  id: number;
  title: string;
  instructor: string;
  level?: string;
  image?: string;
  price?: string;
  className?: string;
  textAlign?: "right" | "center" | "left";
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  instructor,
  level,
  image,
  price,
  className = "",
  textAlign = "right",
}) => {
  const router = useRouter();

  const handleClick = () => {
    // Navigate to course detail page with the course ID
    router.push(`/course/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white rounded-20 p-3 overflow-hidden shadow-orange-soft transition-shadow cursor-pointer hover:shadow-lg ${className}`}
    >
      <div className="relative h-28 w-full rounded-20 overflow-hidden">
        {image ? (
          <Image
            src={getFullUrl(image)}
            alt={title}
            fill
            style={{ objectFit: "cover" }}
            className="w-full h-full"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white bg-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className={`mt-2.5 text-${textAlign}`}>
        <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm font-medium text-gray-900 mb-1">{instructor}</p>
        {level && <p className="text-sm text-gray-600 font-bold">{level}</p>}
        {price && <p className="text-sm text-gray-600 font-bold">₪{price}</p>}
      </div>
    </div>
  );
};
