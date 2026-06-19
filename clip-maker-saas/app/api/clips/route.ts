import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { extractTranscript, buildTranscriptText } from "@/lib/transcript";
import { analyzeTranscriptForClips } from "@/lib/ai-clips";
import { generateClipFiles, cleanupTempFiles } from "@/lib/video-processor";
import { uploadMultipleClips } from "@/lib/storage";

const PROCESSING_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const MAX_VIDEO_DURATION_SECONDS = 60 * 60; // 60 minutes

export async function POST(request: NextRequest) {
  let supabase;
  try {
    supabase = await createClient();
  } catch (clientErr) {
    const msg = clientErr instanceof Error ? clientErr.message : String(clientErr);
    const stack = clientErr instanceof Error ? clientErr.stack : undefined;
    console.error("[POST /api/clips] CRITICAL: Failed to create Supabase client:");
    console.error("  Error:", msg);
    console.error("  Stack:", stack);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  let user;
  try {
    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr) {
      console.error("[POST /api/clips] CRITICAL: Auth getUser error:");
      console.error("  Error code:", authErr.code);
      console.error("  Error message:", authErr.message);
      console.error("  Error status:", authErr.status);
      return NextResponse.json({ error: "Authentication failed", details: authErr.message }, { status: 401 });
    }
    user = authData.user;
  } catch (authException) {
    const msg = authException instanceof Error ? authException.message : String(authException);
    const stack = authException instanceof Error ? authException.stack : undefined;
    console.error("[POST /api/clips] CRITICAL: Exception during getUser:");
    console.error("  Error:", msg);
    console.error("  Stack:", stack);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch (parseErr) {
    const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
    const stack = parseErr instanceof Error ? parseErr.stack : undefined;
    console.error("[POST /api/clips] CRITICAL: Failed to parse request body:");
    console.error("  Error:", msg);
    console.error("  Stack:", stack);
    console.error("  Content-Type:", request.headers.get("content-type"));
    return NextResponse.json({ error: "Invalid request body", details: msg }, { status: 400 });
  }

  console.log("[POST /api/clips] Request payload:", JSON.stringify(body, null, 2));

  const { video_url, video_title, thumbnail_url, channel_name, video_duration_seconds, platform, clip_length, subtitle_style } =
    body as {
      video_url?: string;
      video_title?: string;
      thumbnail_url?: string;
      channel_name?: string;
      video_duration_seconds?: number;
      platform?: string;
      clip_length?: string;
      subtitle_style?: string;
    };

  if (!video_url) {
    return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
  }

  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)[\w-]{11}(&[\w=-]*)?$/;
  if (!youtubeRegex.test(video_url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  // Validate video duration limit
  if (video_duration_seconds && video_duration_seconds > MAX_VIDEO_DURATION_SECONDS) {
    return NextResponse.json({
      error: "Video too long",
      details: `Current version supports videos up to 60 minutes for best performance. Your video is ${Math.round(video_duration_seconds / 60)} minutes.`,
      max_duration: MAX_VIDEO_DURATION_SECONDS,
      video_duration: video_duration_seconds,
    }, { status: 400 });
  }

  let profileData: { free_clips_remaining: number; clips_limit: number; plan: string } | null = null;

  const { data: initialProfile, error: fetchErr } = await supabase
    .from("profiles")
    .select("free_clips_remaining, clips_limit, plan")
    .eq("id", user.id)
    .single();

  if (fetchErr || !initialProfile) {
    const { error: insertErr } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      plan: "free",
      clips_limit: 15,
      free_clips_remaining: 15,
    });

    if (insertErr) {
      console.error("[POST /api/clips] CRITICAL: Failed to create profile:");
      console.error("  Supabase error code:", insertErr.code);
      console.error("  Supabase error message:", insertErr.message);
      console.error("  Supabase error details:", insertErr.details);
      console.error("  Supabase error hint:", insertErr.hint);
      console.error("  User ID:", user.id);
      console.error("  User email:", user.email);
      return NextResponse.json(
        { error: "Failed to create profile", details: insertErr.message },
        { status: 500 }
      );
    }

    const { data: newProfile, error: refetchErr } = await supabase
      .from("profiles")
      .select("free_clips_remaining, clips_limit, plan")
      .eq("id", user.id)
      .single();

    if (refetchErr || !newProfile) {
      console.error("[POST /api/clips] CRITICAL: Failed to load new profile after insert:");
      console.error("  refetchErr:", refetchErr ? { code: refetchErr.code, message: refetchErr.message, details: refetchErr.details, hint: refetchErr.hint } : null);
      console.error("  newProfile:", newProfile);
      console.error("  User ID:", user.id);
      return NextResponse.json(
        { error: "Failed to load new profile", details: refetchErr?.message },
        { status: 500 }
      );
    }

    profileData = newProfile;
  } else {
    profileData = initialProfile;
  }

  if (!profileData) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const isUnlimited = profileData.plan === "enterprise";

  if (!isUnlimited && profileData.free_clips_remaining <= 0) {
    return NextResponse.json({ error: "No free clips remaining" }, { status: 403 });
  }

  const { data: clipRequest, error: insertError } = await supabase
    .from("clip_requests")
    .insert({
      user_id: user.id,
      video_url,
      video_title: video_title ?? null,
      thumbnail_url: thumbnail_url ?? null,
      channel_name: channel_name ?? null,
      status: "Processing",
      processing_stage: "metadata",
      video_duration_seconds: video_duration_seconds ?? null,
      platform: platform ?? "youtube_shorts",
      clip_length: clip_length ?? "auto",
      processing_started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) {
    console.error("[POST /api/clips] CRITICAL: Failed to insert clip_requests row:");
    console.error("  Supabase error code:", insertError.code);
    console.error("  Supabase error message:", insertError.message);
    console.error("  Supabase error details:", insertError.details);
    console.error("  Supabase error hint:", insertError.hint);
    console.error("  Payload:", JSON.stringify({
      user_id: user.id,
      video_url,
      video_title: video_title ?? null,
      thumbnail_url: thumbnail_url ?? null,
      channel_name: channel_name ?? null,
      status: "Processing",
      video_duration_seconds: video_duration_seconds ?? null,
      platform: platform ?? "youtube_shorts",
      clip_length: clip_length ?? "auto",
    }, null, 2));
    return NextResponse.json(
      { error: "Failed to create clip request", details: insertError.message },
      { status: 500 }
    );
  }

  const newRemaining = isUnlimited
    ? profileData.free_clips_remaining
    : profileData.free_clips_remaining - 1;

  if (!isUnlimited) {
    await supabase
      .from("profiles")
      .update({ free_clips_remaining: newRemaining })
      .eq("id", user.id);
  }

  console.log(`[Clip Generation] Starting for ${clipRequest.id} - URL: ${video_url}`);

  generateClipsAsync(
    clipRequest.id,
    video_url,
    video_title ?? "Unknown Video",
    user.id,
    { 
      platform: platform ?? "youtube_shorts", 
      clipLength: clip_length ?? "auto",
      subtitleStyle: subtitle_style ?? "none",
    }
  );

  return NextResponse.json({
    clip_request: clipRequest,
    free_clips_remaining: newRemaining,
  });
}

async function generateClipsAsync(
  clipRequestId: string,
  videoUrl: string,
  videoTitle: string,
  userId: string,
  formatOptions: { platform: string; clipLength: string; subtitleStyle: string }
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
    if (Date.now() - startedAt > PROCESSING_TIMEOUT_MS && !cancelled) {
      cancelled = true;
      console.error(`[Clip Generation] Timeout for ${clipRequestId} after 30 minutes`);
      clearInterval(timeoutCheck);
      await supabase
        .from("clip_requests")
        .update({
          status: "Failed",
          error_message: "Processing timed out. Please try again or use a shorter video.",
        })
        .eq("id", clipRequestId);
      await cleanupTempFiles(clipRequestId);
    }
  }, 30000);

  try {
    if (await checkCancelled()) {
      clearInterval(timeoutCheck);
      return;
    }

    console.log(`[Clip Generation] Extracting transcript for ${clipRequestId}...`);
    await supabase
      .from("clip_requests")
      .update({ processing_stage: "transcript" })
      .eq("id", clipRequestId);

    const segments = await extractTranscript(videoUrl);
    console.log(`[Clip Generation] Got ${segments.length} transcript segments`);

    if (await checkCancelled()) {
      clearInterval(timeoutCheck);
      return;
    }

    const transcriptText = buildTranscriptText(segments);

    console.log(`[Clip Generation] Saving transcript for ${clipRequestId}...`);
    const { error: transcriptErr } = await supabase
      .from("clip_requests")
      .update({ transcript: transcriptText })
      .eq("id", clipRequestId);
    if (transcriptErr) {
      console.error(`[Clip Generation] Failed to save transcript for ${clipRequestId}:`, transcriptErr.message);
    }

    if (await checkCancelled()) {
      clearInterval(timeoutCheck);
      return;
    }

    console.log(`[Clip Generation] Analyzing transcript with Gemini for ${clipRequestId}...`);
    await supabase
      .from("clip_requests")
      .update({ processing_stage: "ai" })
      .eq("id", clipRequestId);

    const clips = await analyzeTranscriptForClips(segments, videoTitle);
    console.log(`[Clip Generation] Generated ${clips.length} clips for ${clipRequestId}`);

    console.log(`[Clip Generation] Saving generated clips for ${clipRequestId}...`);
    const { error: clipsErr } = await supabase
      .from("clip_requests")
      .update({ generated_clips: clips })
      .eq("id", clipRequestId);
    if (clipsErr) {
      console.error(`[Clip Generation] Failed to save generated clips for ${clipRequestId}:`, clipsErr.message);
    }

    if (await checkCancelled()) {
      clearInterval(timeoutCheck);
      return;
    }

    console.log(`[Clip Generation] Downloading video and cutting clips for ${clipRequestId}...`);
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
      clips.map(c => ({
        id: c.id,
        start_time: c.start_time,
        end_time: c.end_time,
      })),
      undefined,
      {
        verticalFormat: {
          platform: formatOptions.platform as "youtube_shorts" | "instagram_reels" | "tiktok" | "universal_vertical",
          clipLength: formatOptions.clipLength as "15" | "30" | "60" | "auto",
        },
        subtitle: {
          style: formatOptions.subtitleStyle as "none" | "basic" | "fancy_mrbeast" | "fancy_green_white" | "fancy_yellow_green" | "fancy_red_white" | "custom",
          position: "bottom",
        },
      },
      () => cancelled
    );

    if (await checkCancelled()) {
      clearInterval(timeoutCheck);
      return;
    }

    console.log(`[Clip Generation] Generated ${clipFiles.length} clip files, uploading to storage...`);
    await supabase
      .from("clip_requests")
      .update({ processing_stage: "upload" })
      .eq("id", clipRequestId);

    // Check if any clips were actually generated
    if (clipFiles.length === 0) {
      console.error(`[Clip Generation] No clip files were generated for ${clipRequestId}`);
      clearInterval(timeoutCheck);
      await supabase
        .from("clip_requests")
        .update({
          status: "Failed",
          error_message: "No clips could be generated. The video may not have suitable moments for short clips.",
          processing_stage: null,
        })
        .eq("id", clipRequestId);
      await cleanupTempFiles(clipRequestId);
      return;
    }

    const uploadResults = await uploadMultipleClips(userId, clipRequestId, clipFiles);

    const clipFilesMap = uploadResults.reduce(
      (acc, result) => {
        acc[result.clipId] = {
          url: result.url,
          fileSize: result.fileSize,
        };
        return acc;
      },
      {} as Record<string, { url: string; fileSize: number }>
    );

    // Check if any uploads succeeded
    if (uploadResults.length === 0) {
      console.error(`[Clip Generation] No clips were uploaded successfully for ${clipRequestId}`);
      clearInterval(timeoutCheck);
      await supabase
        .from("clip_requests")
        .update({
          status: "Failed",
          error_message: "Failed to upload generated clips. Please try again.",
          processing_stage: null,
        })
        .eq("id", clipRequestId);
      await cleanupTempFiles(clipRequestId);
      return;
    }

    console.log(`[Clip Generation] Updating status to Completed for ${clipRequestId} (clips: ${uploadResults.length})...`);
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
      console.error(`[Clip Generation] CRITICAL: Failed to update status to Completed for ${clipRequestId}:`, statusErr.message);
      throw new Error(`Failed to mark clip as completed: ${statusErr.message}`);
    }
    console.log(`[Clip Generation] Status updated to Completed for ${clipRequestId}:`, JSON.stringify({ id: updatedRow?.id, status: updatedRow?.status }));

    console.log(`[Clip Generation] Completed successfully for ${clipRequestId}`);

    await cleanupTempFiles(clipRequestId);
  } catch (error) {
    const errorMessage = getUserFriendlyError(error);

    console.error(`[Clip Generation] Failed for ${clipRequestId}:`, errorMessage);

    console.log(`[Clip Generation] Updating status to Failed for ${clipRequestId}...`);
    const { error: failErr } = await supabase
      .from("clip_requests")
      .update({
        status: "Failed",
        error_message: errorMessage,
        processing_stage: null,
      })
      .eq("id", clipRequestId);

    if (failErr) {
      console.error(`[Clip Generation] CRITICAL: Failed to update status to Failed for ${clipRequestId}:`, failErr.message);
    } else {
      console.log(`[Clip Generation] Status updated to Failed for ${clipRequestId}`);
    }

    await cleanupTempFiles(clipRequestId);
  } finally {
    clearInterval(timeoutCheck);
  }
}

function getUserFriendlyError(error: unknown): string {
  const msg = error instanceof Error ? error.message : "Unknown error occurred";

  if (msg.includes("rate") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
    return "AI service is currently busy. Please try again in a few minutes.";
  }
  if (msg.includes("503") || msg.includes("UNAVAILABLE")) {
    return "AI service is temporarily unavailable. Please try again in a few minutes.";
  }
  if (msg.includes("timeout") || msg.includes("TIMED_OUT")) {
    return "Processing timed out. Please try again or use a shorter video.";
  }
  if (msg.includes("Video unavailable")) {
    return "This video is unavailable or has been removed from YouTube.";
  }
  if (msg.includes("Private video")) {
    return "This video is private and cannot be downloaded.";
  }
  if (msg.includes("Sign in")) {
    return "This video requires authentication to access.";
  }
  if (msg.includes("age")) {
    return "This video has an age restriction and cannot be downloaded.";
  }
  if (msg.includes("upload") || msg.includes("storage")) {
    return "Clip upload failed. Please retry.";
  }
  if (msg.includes("transcript") || msg.includes("Transcript")) {
    return "Could not fetch transcript. This video may not have captions available.";
  }

  return msg.substring(0, 200);
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: clips, error } = await supabase
    .from("clip_requests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[GET /api/clips] CRITICAL: Failed to fetch clips:");
    console.error("  Supabase error code:", error.code);
    console.error("  Supabase error message:", error.message);
    console.error("  Supabase error details:", error.details);
    console.error("  Supabase error hint:", error.hint);
    console.error("  User ID:", user.id);
    return NextResponse.json({ error: "Failed to fetch clips", details: error.message }, { status: 500 });
  }

  // Auto-fix stuck processing requests (older than 35 minutes)
  const stuckThreshold = new Date(Date.now() - 35 * 60 * 1000).toISOString();
  await supabase
    .from("clip_requests")
    .update({
      status: "Failed",
      error_message: "Processing timed out. Please try again or use a shorter video.",
      processing_stage: null,
    })
    .eq("user_id", user.id)
    .eq("status", "Processing")
    .lt("processing_started_at", stuckThreshold);

  let { data: profile } = await supabase
    .from("profiles")
    .select("free_clips_remaining, clips_limit, plan")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const { error: insertErr } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      plan: "free",
      clips_limit: 15,
      free_clips_remaining: 15,
    });

    if (insertErr) {
      console.error("[API /clips GET] profile insert error:", insertErr.message);
    }

    const { data: newProfile } = await supabase
      .from("profiles")
      .select("free_clips_remaining, clips_limit, plan")
      .eq("id", user.id)
      .single();

    profile = newProfile;
  }

  const clipsLimit = profile?.clips_limit ?? 15;
  const freeClipsRemaining = profile?.free_clips_remaining ?? clipsLimit;
  const clipsUsed = clipsLimit - freeClipsRemaining;

  return NextResponse.json({
    clips,
    free_clips_remaining: freeClipsRemaining,
    clips_used: clipsUsed,
    clips_limit: clipsLimit,
    plan: profile?.plan ?? "free",
  });
}
