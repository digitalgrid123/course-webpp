"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface VerificationCodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  isRTL?: boolean;
}

export default function VerificationCodeInput({
  length = 4,
  value,
  onChange,
  error,
  isRTL = false,
}: VerificationCodeInputProps) {
  const inputsRef = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (value.length === length) {
      inputsRef.current[length - 1]?.blur();
    }
  }, [value, length]);

  const handleInputChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newValue = Array.from({ length }, (_, i) => value[i] || "");
    newValue[index] = val;
    onChange(newValue.join(""));

    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newValue = Array.from({ length }, (_, i) => value[i] || "");

      if (newValue[index]) {
        newValue[index] = "";
        onChange(newValue.join(""));
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        newValue[index - 1] = "";
        onChange(newValue.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`flex gap-3 justify-center ${
          isRTL ? "flex-row-reverse" : ""
        }`}
      >
        {Array.from({ length }).map((_, i) => (
          <Input
            key={i}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ""}
            onChange={(e) => handleInputChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            ref={(el) => {
              inputsRef.current[i] = el!;
            }}
            className={`w-14 h-14 text-center text-xl font-semibold rounded-lg border-2 transition-all duration-200 focus:border-amber-gold focus:ring-1 focus:ring-amber-gold ${
              error ? "border-red-500" : "border-slate-gray"
            } bg-white shadow-sm`}
          />
        ))}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1 text-center">{error}</p>
      )}
    </div>
  );
}
