"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getFullUrl } from "@/utils/helper";

interface TeacherCardProps {
  id: number;
  name: string;
  bio: string;
  image: string;
  coursesCount: number;
  detail?: string;
  className?: string;
  textAlign?: "right" | "center" | "left";
}

export const TeacherCard: React.FC<TeacherCardProps> = ({
  id,
  name,
  bio,
  image,
  coursesCount,
  className = "",
  textAlign = "right",
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/instructor/${id}`);
  };

  // Function to strip HTML tags and truncate text
  const stripHtml = (html: string) => {
    if (typeof document === "undefined") return html;
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const truncateText = (text: string, maxLength: number) => {
    const cleanText = stripHtml(text);
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + "...";
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={`bg-white rounded-20 p-3 overflow-hidden shadow-orange-soft transition-shadow cursor-pointer hover:shadow-lg h-full flex flex-col ${className}`}
      >
        <div className="flex flex-col items-center flex-1">
          {/* Teacher Avatar */}
          <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4 border-4 border-gray-100 flex-shrink-0">
            {image ? (
              <Image
                src={getFullUrl(image)}
                alt={name}
                fill
                style={{ objectFit: "cover" }}
                className="w-full h-full"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                <svg
                  className="w-12 h-12"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Teacher Info */}
          <div className={`w-full text-${textAlign} flex-1 flex flex-col`}>
            <h3 className="font-bold text-gray-800 text-lg mb-2 text-center">
              {name}
            </h3>

            <div className="flex-1 min-h-16 mb-3">
              <p className="text-sm text-gray-600 line-clamp-3 h-full text-center">
                {truncateText(bio, 120)}
              </p>
            </div>

            <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-500 gap-1">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-700">
                  <span className="ml-1 text-amber-700 font-semibold">
                    {coursesCount}
                  </span>
                  {coursesCount === 1 ? " קורס" : " קורסים"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
