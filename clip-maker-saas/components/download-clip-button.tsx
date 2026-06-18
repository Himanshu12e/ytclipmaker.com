"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

interface DownloadClipButtonProps {
  clipUrl: string;
  clipTitle: string;
  className?: string;
}

export function DownloadClipButton({ clipUrl, clipTitle, className }: DownloadClipButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(clipUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${clipTitle.replace(/[^a-zA-Z0-9]/g, "_")}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(clipUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={`inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-all hover:opacity-90 disabled:opacity-50 ${className}`}
    >
      {downloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download Clip
        </>
      )}
    </button>
  );
}
