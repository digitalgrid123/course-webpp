"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { X } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  iconSrc?: string;
  iconAlt?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  showSearch?: boolean;
  loading?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onSelect,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  iconSrc,
  iconAlt = "dropdown-icon",
  disabled = false,
  className = "",
  dropdownClassName = "",
  showSearch = true,
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile dropdown is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isMobile]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (!disabled && !loading) {
      setIsOpen(!isOpen);
      if (isOpen) {
        setSearchTerm("");
      }
    }
  };

  // Get display text for selected value
  const displayText = selectedValue
    ? options.find((opt) => opt.value === selectedValue)?.label || placeholder
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        className={`flex items-center justify-between gap-2 px-4 py-2 rounded-xl transition-colors ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        onClick={handleToggle}
        disabled={disabled || loading}
      >
        <span className="text-base text-slate-gray font-bold truncate max-w-32 md:max-w-none md:truncate-none">
          {loading ? "טוען..." : displayText}
        </span>
        {iconSrc && (
          <Image
            src={iconSrc}
            width={20}
            height={20}
            alt={iconAlt}
            className="shrink-0"
          />
        )}
      </button>

      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Content */}
      {isOpen && (
        <div
          className={`
            ${
              isMobile
                ? `fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl z-50 
                   transform transition-transform duration-300 ease-in-out
                   ${isOpen ? "translate-y-0" : "translate-y-full"}`
                : `absolute left-0 w-64 bg-white border-1.5 rounded shadow-md border-amber-gold z-10 top-full mt-2`
            }
            ${dropdownClassName}
          `}
        >
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="text-lg font-semibold flex-1 text-center">
                {placeholder}
              </h3>
              <div className="w-10"></div> {/* Spacer for balance */}
            </div>
          )}

          {/* Search */}
          {showSearch && (
            <div
              className={`${isMobile ? "p-4" : "p-2 border-b border-gray-200"}`}
            >
              <Input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-right"
                autoFocus={!isMobile} // Auto-focus on desktop but not on mobile to avoid keyboard popup
              />
            </div>
          )}

          {/* Options List */}
          <ul
            className={`overflow-y-auto ${
              isMobile ? "max-h-96 pb-8" : "max-h-60"
            }`}
          >
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                className={`px-4 py-3 hover:bg-gray-100 cursor-pointer text-right transition-colors ${
                  selectedValue === option.value
                    ? "bg-amber-50 border-r-2 border-amber-gold"
                    : ""
                } ${isMobile ? "text-lg" : ""}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="px-4 py-3 text-right text-gray-500">
                לא נמצאו תוצאות
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
