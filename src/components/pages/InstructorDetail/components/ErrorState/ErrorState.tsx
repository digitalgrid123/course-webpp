// components/ErrorState/ErrorState.tsx
import React from "react";
import { useRouter } from "next/navigation";

interface ErrorStateProps {
  error: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  const router = useRouter();

  return (
    <div
      className="min-h-screen bg-white px-4 sm:px-8 py-8 flex items-center justify-center"
      dir="rtl"
    >
      <div className="text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <div className="text-xl text-red-500 mb-2">שגיאה בטעינת המרצה</div>
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
};
