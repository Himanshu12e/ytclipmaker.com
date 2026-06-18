import { exec as execCb } from "child_process";
import { promisify } from "util";
import { unlink, mkdir, readdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { extractVideoId } from "./youtube";

const execAsync = promisify(execCb);

const TEMP_DIR = join(process.cwd(), "temp", "clips");

function resolveToolPath(envKey: string, winDefault: string, unixDefault: string): string {
  if (process.env[envKey]) return process.env[envKey]!;
  return process.platform === "win32" ? winDefault : unixDefault;
}

const YTDLP_PATH = resolveToolPath(
  "YTDLP_PATH",
  "C:\\Users\\himya\\AppData\\Roaming\\Python\\Python314\\Scripts\\yt-dlp.exe",
  "yt-dlp"
);

const FFMPEG_PATH = resolveToolPath(
  "FFMPEG_PATH",
  "C:\\tools\\ffmpeg\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe",
  "ffmpeg"
);

function getExecOptions() {
  const extraPaths = [
    "C:\\Users\\himya\\AppData\\Roaming\\Python\\Python314\\Scripts",
    "C:\\tools\\ffmpeg\\ffmpeg-master-latest-win64-gpl\\bin",
  ].join(";");

  return {
    timeout: 300000,
    maxBuffer: 50 * 1024 * 1024,
    env: {
      ...process.env,
      PATH: `${extraPaths};${process.env.PATH || ""}`,
    },
  };
}

export interface ClipFile {
  clipId: string;
  filePath: string;
  fileName: string;
}

async function ensureTempDir() {
  if (!existsSync(TEMP_DIR)) {
    await mkdir(TEMP_DIR, { recursive: true });
  }
}

export async function downloadYouTubeVideo(
  videoUrl: string,
  requestId: string
): Promise<string> {
  await ensureTempDir();
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    throw new Error("Invalid YouTube URL - could not extract video ID");
  }

  const outputPath = join(TEMP_DIR, `${requestId}_source.mp4`);

  console.log(`[VideoProcessor] Downloading video: ${videoId}`);

  const ytdlpArgs = [
    "--no-playlist",
    "--merge-output-format", "mp4",
    "-f", "bestvideo[height<=720]+bestaudio/best[height<=720]/best",
    "--no-overwrites",
    "--no-warnings",
    "--quiet",
    "--print", "after_move:filepath",
    "-o", outputPath,
    videoUrl,
  ];

  try {
    const cmd = `"${YTDLP_PATH}" ${ytdlpArgs.map(a => `"${a}"`).join(" ")}`;
    console.log(`[VideoProcessor] Running: ${cmd}`);
    const { stdout } = await execAsync(cmd, getExecOptions());

    const actualPath = stdout.trim().split("\n").pop() || outputPath;

    if (!existsSync(actualPath)) {
      throw new Error(`Downloaded file not found at ${actualPath}`);
    }

    console.log(`[VideoProcessor] Video downloaded: ${actualPath}`);
    return actualPath;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[VideoProcessor] Download failed:`, errMsg);

    if (errMsg.includes("Video unavailable")) {
      throw new Error("This video is unavailable or has been removed from YouTube.");
    }
    if (errMsg.includes("Private video")) {
      throw new Error("This video is private and cannot be downloaded.");
    }
    if (errMsg.includes("Sign in")) {
      throw new Error("This video requires authentication to access.");
    }
    if (errMsg.includes("age")) {
      throw new Error("This video has an age restriction and cannot be downloaded.");
    }

    throw new Error(`Failed to download video: ${errMsg.substring(0, 200)}`);
  }
}

export async function cutVideoClip(
  sourcePath: string,
  startTime: number,
  endTime: number,
  clipId: string,
  requestId: string
): Promise<string> {
  await ensureTempDir();
  const outputPath = join(TEMP_DIR, `${requestId}_${clipId}.mp4`);
  const duration = endTime - startTime;

  console.log(`[VideoProcessor] Cutting clip ${clipId}: ${startTime}s - ${endTime}s (${duration}s)`);

  const ffmpegArgs = [
    "-y",
    "-ss", String(startTime),
    "-i", `"${sourcePath}"`,
    "-t", String(duration),
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "23",
    "-c:a", "aac",
    "-b:a", "128k",
    "-movflags", "+faststart",
    "-avoid_negative_ts", "make_zero",
    `"${outputPath}"`,
  ];

  try {
    const cmd = `"${FFMPEG_PATH}" ${ffmpegArgs.join(" ")}`;
    console.log(`[VideoProcessor] Running: ${cmd}`);
    await execAsync(cmd, getExecOptions());

    if (!existsSync(outputPath)) {
      throw new Error("Clip file was not created");
    }

    const stat = await import("fs/promises").then(fs => fs.stat(outputPath));
    console.log(`[VideoProcessor] Clip ${clipId} created: ${(stat.size / 1024 / 1024).toFixed(2)}MB`);

    return outputPath;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[VideoProcessor] Clip ${clipId} cut failed:`, errMsg);
    throw new Error(`Failed to cut clip ${clipId}: ${errMsg.substring(0, 200)}`);
  }
}

export async function generateClipFiles(
  videoUrl: string,
  requestId: string,
  clips: Array<{ id: string; start_time: number; end_time: number }>,
  onProgress?: (clipIndex: number, status: "downloading" | "cutting" | "uploading" | "done" | "error", error?: string) => void
): Promise<ClipFile[]> {
  const results: ClipFile[] = [];

  try {
    onProgress?.(0, "downloading");
    const sourcePath = await downloadYouTubeVideo(videoUrl, requestId);
    onProgress?.(0, "done");

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      try {
        onProgress?.(i, "cutting");
        const clipPath = await cutVideoClip(
          sourcePath,
          clip.start_time,
          clip.end_time,
          clip.id,
          requestId
        );

        const fileName = `${requestId}_${clip.id}.mp4`;
        results.push({
          clipId: clip.id,
          filePath: clipPath,
          fileName,
        });
        onProgress?.(i, "done");
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error(`[VideoProcessor] Failed to generate clip ${clip.id}:`, errMsg);
        onProgress?.(i, "error", errMsg);
      }
    }

    try {
      if (existsSync(sourcePath)) {
        await unlink(sourcePath);
        console.log(`[VideoProcessor] Cleaned up source video`);
      }
    } catch {
      console.warn(`[VideoProcessor] Failed to cleanup source video`);
    }

    return results;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[VideoProcessor] Pipeline failed:`, errMsg);
    throw error;
  }
}

export async function cleanupTempFiles(requestId: string): Promise<void> {
  try {
    if (!existsSync(TEMP_DIR)) return;

    const files = await readdir(TEMP_DIR);
    for (const file of files) {
      if (file.startsWith(requestId)) {
        await unlink(join(TEMP_DIR, file)).catch(() => {});
      }
    }
  } catch {
    console.warn(`[VideoProcessor] Failed to cleanup temp files for ${requestId}`);
  }
}
