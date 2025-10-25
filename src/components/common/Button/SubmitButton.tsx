"use client";

import { Loader2 } from "lucide-react";

interface SubmitButtonProps {
  isSubmitting: boolean;
  isValid: boolean;
  label: string;
  className?: string;
}

export default function SubmitButton({
  isSubmitting,
  isValid,
  label,
  className = "",
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting || !isValid}
      className={`
        w-full py-3 px-4 rounded-lg
        font-medium text-base
        transition-all duration-200
        flex items-center justify-center gap-2
        ${
          isSubmitting || !isValid
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-amber-gold text-white hover:bg-amber-600 active:scale-[0.98]"
        }
        ${className}
      `}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="animate-spin" size={20} />
          <span>Loading...</span>
        </>
      ) : (
        label
      )}
    </button>
  );
}
