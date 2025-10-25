"use client";

import { Download } from "lucide-react";
import Image from "next/image";

interface DownloadCardProps {
  title: string;
  subtitle: string;
  downloadUrl?: string;
}

export function DownloadCard({
  title,
  subtitle,
  downloadUrl,
}: DownloadCardProps) {
  const handleDownload = () => {
    if (!downloadUrl) return;

    if (
      downloadUrl.startsWith("http://") ||
      downloadUrl.startsWith("https://")
    ) {
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } else {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-card p-6 border border-soft-gray transition-all hover:shadow-md">
      <div className="flex-shrink-0">
        <div className="flex h-12 w-12 items-center justify-center bg-soft-gray rounded-full">
          <Image
            src={"/assets/images/icons/document.svg"}
            width={20}
            height={25}
            alt="document"
          />
        </div>
      </div>

      <div className="flex-1 px-6 text-right">
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="text-xs text-stone-gray">{subtitle}</p>
      </div>

      <div className="flex-shrink-0">
        <button
          onClick={handleDownload}
          disabled={!downloadUrl}
          className={`flex items-center gap-2 transition-colors ${
            downloadUrl
              ? "text-amber-gold hover:text-amber-600 cursor-pointer"
              : "text-gray-400 cursor-not-allowed"
          }`}
        >
          <Download className="h-5 w-5" />
          <span className="text-sm font-medium">הורדת הקובץ</span>
        </button>
      </div>
    </div>
  );
}
