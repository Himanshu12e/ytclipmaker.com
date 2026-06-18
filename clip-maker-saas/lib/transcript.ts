import { YoutubeTranscript, type TranscriptResponse } from "youtube-transcript";
import { extractVideoId } from "./youtube";

export interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export async function extractTranscript(
  videoUrl: string
): Promise<TranscriptSegment[]> {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  const rawTranscript: TranscriptResponse[] =
    await YoutubeTranscript.fetchTranscript(videoId);

  return rawTranscript.map((segment) => ({
    text: segment.text,
    start: segment.offset / 1000,
    duration: segment.duration / 1000,
  }));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function buildTranscriptText(segments: TranscriptSegment[]): string {
  return segments
    .map((s) => `[${formatTime(s.start)}] ${s.text}`)
    .join("\n");
}
