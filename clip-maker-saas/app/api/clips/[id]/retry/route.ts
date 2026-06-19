import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { extractTranscript, buildTranscriptText } from "@/lib/transcript";
import { analyzeTranscriptForClips } from "@/lib/ai-clips";
import { generateClipFiles, cleanupTempFiles, type VerticalFormatOptions } from "@/lib/video-processor";
import { uploadMultipleClips } from "@/lib/storage";
import type { GeneratedClip } from "@/lib/ai-clips";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: clipRequest, error: fetchError } = await supabase
    .from("clip_requests")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !clipRequest) {
    return NextResponse.json({ error: "Clip request not found" }, { status: 404 });
  }

  if (clipRequest.status !== "Failed" && clipRequest.status !== "Cancelled") {
    return NextResponse.json(
      { error: "Can only retry failed or cancelled clip generations" },
      { status: 400 }
    );
  }

  const serviceSupabase = createServiceClient();

  await serviceSupabase
    .from("clip_requests")
    .update({
      status: "Processing",
      error_message: null,
      clip_files: null,
      processing_stage: "metadata",
      processing_started_at: new Date().toISOString(),
    })
    .eq("id", id);

  const formatOptions: VerticalFormatOptions = {
    platform: clipRequest.platform || "youtube_shorts",
    clipLength: clipRequest.clip_length || "auto",
  };

  processRetryGeneration(id, clipRequest.video_url, clipRequest.video_title || "Unknown Video", user.id, formatOptions);

  return NextResponse.json({ message: "Retry started", clip_request_id: id });
}

async function processRetryGeneration(
  clipRequestId: string,
  videoUrl: string,
  videoTitle: string,
  userId: string,
  formatOptions: VerticalFormatOptions
) {
  const supabase = createServiceClient();
  let cancelled = false;

  const checkCancelled = async (): Promise<boolean> => {
    if (cancelled) return true;
    const { data } = await supabase
      .from("clip_requests")
      .select("status")
      .eq("id", clipRequestId)
      .single();
    if (data?.status === "Cancelled") {
      cancelled = true;
      return true;
    }
    return false;
  };

  const startedAt = Date.now();
  const timeoutCheck = setInterval(async () => {
    if (Date.now() - startedAt > 30 * 60 * 1000 && !cancelled) {
      cancelled = true;
      clearInterval(timeoutCheck);
      await supabase
        .from("clip_requests")
        .update({
          status: "Failed",
          error_message: "Processing timed out. Please try again or use a shorter video.",
          processing_stage: null,
        })
        .eq("id", clipRequestId);
      await cleanupTempFiles(clipRequestId);
    }
  }, 30000);

  try {
    const generatedClips = (await supabase
      .from("clip_requests")
      .select("generated_clips")
      .eq("id", clipRequestId)
      .single()).data?.generated_clips as GeneratedClip[] | null;

    if (!generatedClips || generatedClips.length === 0) {
      if (await checkCancelled()) {
        clearInterval(timeoutCheck);
        return;
      }

      await supabase
        .from("clip_requests")
        .update({ processing_stage: "transcript" })
        .eq("id", clipRequestId);

      const segments = await extractTranscript(videoUrl);
      const transcriptText = buildTranscriptText(segments);

      await supabase
        .from("clip_requests")
        .update({ transcript: transcriptText })
        .eq("id", clipRequestId);

      if (await checkCancelled()) {
        clearInterval(timeoutCheck);
        return;
      }

      await supabase
        .from("clip_requests")
        .update({ processing_stage: "ai" })
        .eq("id", clipRequestId);

      const clips = await analyzeTranscriptForClips(segments, videoTitle);

      await supabase
        .from("clip_requests")
        .update({ generated_clips: clips })
        .eq("id", clipRequestId);

      if (await checkCancelled()) {
        clearInterval(timeoutCheck);
        return;
      }

      await supabase
        .from("clip_requests")
        .update({ processing_stage: "download" })
        .eq("id", clipRequestId);

      await supabase
        .from("clip_requests")
        .update({ processing_stage: "cut" })
        .eq("id", clipRequestId);

      const clipFiles = await generateClipFiles(
        videoUrl,
        clipRequestId,
        clips.map(c => ({ id: c.id, start_time: c.start_time, end_time: c.end_time })),
        undefined,
        formatOptions,
        () => cancelled
      );

      if (await checkCancelled()) {
        clearInterval(timeoutCheck);
        return;
      }

      await supabase
        .from("clip_requests")
        .update({ processing_stage: "upload" })
        .eq("id", clipRequestId);

      const uploadResults = await uploadMultipleClips(userId, clipRequestId, clipFiles);
      const clipFilesMap = uploadResults.reduce((acc, result) => {
        acc[result.clipId] = result.url;
        return acc;
      }, {} as Record<string, string>);

      await supabase
        .from("clip_requests")
        .update({
          clip_files: clipFilesMap,
          status: "Completed",
          clips_generated: uploadResults.length,
          completed_at: new Date().toISOString(),
          processing_stage: "completed",
        })
        .eq("id", clipRequestId);

      await cleanupTempFiles(clipRequestId);
      return;
    }

    console.log(`[Retry Generation] Starting for ${clipRequestId} - ${generatedClips.length} clips`);

    await supabase
      .from("clip_requests")
      .update({ processing_stage: "download" })
      .eq("id", clipRequestId);

    await supabase
      .from("clip_requests")
      .update({ processing_stage: "cut" })
      .eq("id", clipRequestId);

    const clipFiles = await generateClipFiles(
      videoUrl,
      clipRequestId,
      generatedClips.map(c => ({
        id: c.id,
        start_time: c.start_time,
        end_time: c.end_time,
      })),
      undefined,
      formatOptions,
      () => cancelled
    );

    if (clipFiles.length === 0) {
      throw new Error("Failed to generate any clip files");
    }

    if (await checkCancelled()) {
      clearInterval(timeoutCheck);
      return;
    }

    console.log(`[Retry Generation] Generated ${clipFiles.length} clip files, uploading...`);
    await supabase
      .from("clip_requests")
      .update({ processing_stage: "upload" })
      .eq("id", clipRequestId);

    const uploadResults = await uploadMultipleClips(userId, clipRequestId, clipFiles);

    const clipFilesMap = uploadResults.reduce(
      (acc, result) => {
        acc[result.clipId] = result.url;
        return acc;
      },
      {} as Record<string, string>
    );

    console.log(`[Retry Generation] Updating status to Completed for ${clipRequestId} (clips: ${uploadResults.length})...`);
    const { data: updatedRow, error: statusErr } = await supabase
      .from("clip_requests")
      .update({
        clip_files: clipFilesMap,
        status: "Completed",
        clips_generated: uploadResults.length,
        completed_at: new Date().toISOString(),
        processing_stage: "completed",
      })
      .eq("id", clipRequestId)
      .select()
      .single();

    if (statusErr) {
      console.error(`[Retry Generation] CRITICAL: Failed to update status to Completed for ${clipRequestId}:`, statusErr.message);
      throw new Error(`Failed to mark clip as completed: ${statusErr.message}`);
    }
    console.log(`[Retry Generation] Status updated to Completed for ${clipRequestId}:`, JSON.stringify({ id: updatedRow?.id, status: updatedRow?.status }));

    await cleanupTempFiles(clipRequestId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`[Retry Generation] Failed for ${clipRequestId}:`, errorMessage);

    const friendlyMsg = errorMessage.includes("timeout") || errorMessage.includes("TIMED_OUT")
      ? "Processing timed out. Please try again or use a shorter video."
      : errorMessage.includes("rate") || errorMessage.includes("429")
        ? "AI service is currently busy. Please try again in a few minutes."
        : errorMessage.substring(0, 200);

    console.log(`[Retry Generation] Updating status to Failed for ${clipRequestId}...`);
    const { error: failErr } = await supabase
      .from("clip_requests")
      .update({
        status: "Failed",
        error_message: friendlyMsg,
        processing_stage: null,
      })
      .eq("id", clipRequestId);

    if (failErr) {
      console.error(`[Retry Generation] CRITICAL: Failed to update status to Failed for ${clipRequestId}:`, failErr.message);
    } else {
      console.log(`[Retry Generation] Status updated to Failed for ${clipRequestId}`);
    }

    await cleanupTempFiles(clipRequestId);
  } finally {
    clearInterval(timeoutCheck);
  }
}
