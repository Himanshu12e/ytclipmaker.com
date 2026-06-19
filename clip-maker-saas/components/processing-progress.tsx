"use client";

import { Loader2, Download, Scissors, Upload, CheckCircle2, AlertCircle, FileText, Sparkles } from "lucide-react";

interface ProcessingProgressProps {
  status: "Processing" | "Completed" | "Failed" | "Cancelled";
  currentStep?: string | null;
  clipFiles?: Record<string, string> | null;
  error?: string | null;
  onRetry?: () => void;
}

const processingSteps = [
  { key: "metadata", label: "Fetching video metadata", icon: FileText },
  { key: "transcript", label: "Extracting transcript", icon: FileText },
  { key: "ai", label: "Finding viral moments", icon: Sparkles },
  { key: "download", label: "Downloading video", icon: Download },
  { key: "cut", label: "Generating clips", icon: Scissors },
  { key: "upload", label: "Uploading clips", icon: Upload },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
];

export function ProcessingProgress({ status, currentStep, clipFiles, error, onRetry }: ProcessingProgressProps) {
  if (status === "Completed") {
    const clipCount = clipFiles ? Object.keys(clipFiles).length : 0;
    return (
      <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
        <CheckCircle2 className="h-5 w-5 text-green-400" />
        <div>
          <p className="text-sm font-medium text-green-300">
            Clips generated successfully!
          </p>
          <p className="text-xs text-muted-foreground">
            {clipCount} MP4 clip{clipCount !== 1 ? "s" : ""} ready for download
          </p>
        </div>
      </div>
    );
  }

  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
        <AlertCircle className="h-5 w-5 text-yellow-400" />
        <div>
          <p className="text-sm font-medium text-yellow-300">
            Processing cancelled successfully.
          </p>
          <p className="text-xs text-muted-foreground">
            You can submit another video.
          </p>
        </div>
      </div>
    );
  }

  if (status === "Failed") {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">
              Generation Failed
            </p>
            <p className="text-xs text-muted-foreground">
              {error || "An unknown error occurred"}
            </p>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const currentStepIndex = currentStep
    ? processingSteps.findIndex((s) => s.key === currentStep)
    : 0;

  const progressPercent = currentStepIndex >= 0
    ? Math.round(((currentStepIndex + 1) / processingSteps.length) * 100)
    : 0;

  return (
    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
      <div className="flex items-center gap-3 mb-4">
        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        <div className="flex-1">
          <span className="text-sm font-medium text-blue-300">
            {currentStep ? processingSteps.find((s) => s.key === currentStep)?.label || "Processing..." : "Starting..."}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">
            {progressPercent}%
          </span>
        </div>
      </div>

      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="space-y-1">
        {processingSteps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 rounded-lg px-3 py-1.5 transition-colors ${
                isCurrent
                  ? "bg-blue-500/10"
                  : isCompleted
                    ? "bg-green-500/5"
                    : "opacity-40"
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              ) : isCurrent ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
              ) : (
                <StepIcon className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span
                className={`text-xs ${
                  isCurrent
                    ? "text-blue-300 font-medium"
                    : isCompleted
                      ? "text-green-300"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
              {isCompleted && (
                <span className="ml-auto text-xs text-green-400">✓</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
