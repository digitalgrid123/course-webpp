"use client";

import { forwardRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface FormInputFieldProps {
  id: string;
  type?: string;
  label: string;
  placeholder?: string;
  error?: string;
  isRTL?: boolean;
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  className?: string;
  disabled?: boolean; // Add this line
  value?: string; // Also add value prop for better form control
}

const FormInputField = forwardRef<HTMLInputElement, FormInputFieldProps>(
  (
    {
      id,
      type = "text",
      label,
      placeholder,
      error,
      isRTL = false,
      name,
      onBlur,
      onChange,
      className,
      disabled = false, // Add default value
      value, // Add value prop
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === "password";

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    return (
      <div>
        {label && (
          <Label
            htmlFor={id}
            className={`mb-2.5 leading-5 font-medium text-sm block ${
              isRTL ? "text-right" : ""
            }`}
          >
            {label}
          </Label>
        )}

        <div className="relative">
          <Input
            id={id}
            ref={ref}
            name={name}
            type={isPassword ? (showPassword ? "text" : "password") : type}
            placeholder={placeholder}
            onChange={onChange}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
            disabled={disabled} // Pass disabled prop
            value={value} // Pass value prop
            style={{
              caretColor: isFocused ? "#D4AF37" : "#9ca3af",
            }}
            className={`
              border-2 transition-colors
              [caret-shape:bar]
              ${
                isFocused
                  ? "border-amber-gold caret-amber-gold"
                  : "border-soft-gray"
              }
              ${error ? "border-red-500" : ""}
              ${disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : ""}
              placeholder-silver-gray
              text-gray-900
              focus:!outline-none focus:!ring-0
              ${isPassword && isRTL ? "pr-12" : ""}
              ${isPassword && !isRTL ? "pl-12" : ""}
              ${isRTL ? "text-right" : ""}
              ${className || ""}
            `}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled} // Also disable the button when input is disabled
              className={`absolute top-1/2 -translate-y-1/2 ${
                isRTL ? "right-3" : "left-3"
              } text-charcoal-blue hover:text-gray-700 transition-colors focus:outline-none ${
                disabled ? "cursor-not-allowed opacity-50" : ""
              }`}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>

        {error && (
          <p
            className={`text-red-500 text-sm mt-1 ${isRTL ? "text-right" : ""}`}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormInputField.displayName = "FormInputField";

export default FormInputField;
