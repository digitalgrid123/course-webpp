"use client";

import Image from "next/image";
import React from "react";

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
  onBack?: () => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onBack }) => {
  const mainPath = items
    .slice(0, -1)
    .map((i) => i.label)
    .join("-");
  const lastItem = items[items.length - 1].label;

  return (
    <div className="flex items-center justify-end gap-4 py-2" dir="rtl">
      <div className="hidden sm:flex items-center gap-2 text-charcoal-blue text-sm">
        <span className="font-medium text-charcoal-blue">{lastItem}</span>
        <span className="text-gray-500">/</span>
        <span className="underline underline-offset-4 decoration-gray-400 cursor-pointer hover:text-amber-gold hover:decoration-amber-gold">
          {mainPath}
        </span>
      </div>

      <button
        onClick={onBack}
        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition bg-gray-100"
      >
        <Image
          src={"/assets/images/icons/arrow-left.svg"}
          width={20}
          height={20}
          alt="left-arrow"
        />
      </button>
    </div>
  );
};

export default Breadcrumb;
