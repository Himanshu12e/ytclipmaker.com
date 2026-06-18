import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { extractTranscript, buildTranscriptText } from "@/lib/transcript";
import { analyzeTranscriptForClips } from "@/lib/ai-clips";
import { generateClipFiles, cleanupTempFiles } from "@/lib/video-processor";
import { uploadMultipleClips } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { video_url, video_title, thumbnail_url, channel_name } =
    await request.json();

  if (!video_url) {
    return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
  }

  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)[\w-]{11}(&[\w=-]*)?$/;
  if (!youtubeRegex.test(video_url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
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
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to create clip request" },
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

  generateClipsAsync(clipRequest.id, video_url, video_title ?? "Unknown Video", user.id);

  return NextResponse.json({
    clip_request: clipRequest,
    free_clips_remaining: newRemaining,
  });
}

async function generateClipsAsync(
  clipRequestId: string,
  videoUrl: string,
  videoTitle: string,
  userId: string
) {
  const supabase = createServiceClient();

  try {
    console.log(`[Clip Generation] Extracting transcript for ${clipRequestId}...`);
    const segments = await extractTranscript(videoUrl);
    console.log(`[Clip Generation] Got ${segments.length} transcript segments`);

    const transcriptText = buildTranscriptText(segments);

    console.log(`[Clip Generation] Saving transcript for ${clipRequestId}...`);
    const { error: transcriptErr } = await supabase
      .from("clip_requests")
      .update({ transcript: transcriptText })
      .eq("id", clipRequestId);
    if (transcriptErr) {
      console.error(`[Clip Generation] Failed to save transcript for ${clipRequestId}:`, transcriptErr.message);
    }

    console.log(`[Clip Generation] Analyzing transcript with Gemini for ${clipRequestId}...`);
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

    console.log(`[Clip Generation] Downloading video and cutting clips for ${clipRequestId}...`);

    const clipFiles = await generateClipFiles(
      videoUrl,
      clipRequestId,
      clips.map(c => ({
        id: c.id,
        start_time: c.start_time,
        end_time: c.end_time,
      }))
    );

    console.log(`[Clip Generation] Generated ${clipFiles.length} clip files, uploading to storage...`);

    const uploadResults = await uploadMultipleClips(userId, clipRequestId, clipFiles);

    const clipFilesMap = uploadResults.reduce(
      (acc, result) => {
        acc[result.clipId] = result.url;
        return acc;
      },
      {} as Record<string, string>
    );

    console.log(`[Clip Generation] Updating status to Completed for ${clipRequestId} (clips: ${uploadResults.length})...`);
    const { data: updatedRow, error: statusErr } = await supabase
      .from("clip_requests")
      .update({
        clip_files: clipFilesMap,
        status: "Completed",
        clips_generated: uploadResults.length,
        completed_at: new Date().toISOString(),
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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error(`[Clip Generation] Failed for ${clipRequestId}:`, errorMessage);

    console.log(`[Clip Generation] Updating status to Failed for ${clipRequestId}...`);
    const { error: failErr } = await supabase
      .from("clip_requests")
      .update({
        status: "Failed",
        error_message: errorMessage,
      })
      .eq("id", clipRequestId);

    if (failErr) {
      console.error(`[Clip Generation] CRITICAL: Failed to update status to Failed for ${clipRequestId}:`, failErr.message);
    } else {
      console.log(`[Clip Generation] Status updated to Failed for ${clipRequestId}`);
    }

    await cleanupTempFiles(clipRequestId);
  }
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
    return NextResponse.json({ error: "Failed to fetch clips" }, { status: 500 });
  }

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
