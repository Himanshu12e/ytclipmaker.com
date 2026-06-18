import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateClipFiles, cleanupTempFiles } from "@/lib/video-processor";
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

  if (clipRequest.status !== "Failed") {
    return NextResponse.json(
      { error: "Can only retry failed clip generations" },
      { status: 400 }
    );
  }

  const serviceSupabase = createServiceClient();

  await serviceSupabase
    .from("clip_requests")
    .update({ status: "Processing", error_message: null, clip_files: null })
    .eq("id", id);

  processClipGeneration(id, clipRequest.video_url, clipRequest.video_title || "Unknown Video", user.id);

  return NextResponse.json({ message: "Retry started", clip_request_id: id });
}

async function processClipGeneration(
  clipRequestId: string,
  videoUrl: string,
  videoTitle: string,
  userId: string
) {
  const supabase = createServiceClient();

  try {
    const generatedClips = clipRequestId
      ? (await supabase.from("clip_requests").select("generated_clips").eq("id", clipRequestId).single()).data?.generated_clips as GeneratedClip[] | null
      : null;

    if (!generatedClips || generatedClips.length === 0) {
      throw new Error("No clips to generate - please regenerate AI analysis first");
    }

    console.log(`[Retry Generation] Starting for ${clipRequestId} - ${generatedClips.length} clips`);

    const clipFiles = await generateClipFiles(
      videoUrl,
      clipRequestId,
      generatedClips.map(c => ({
        id: c.id,
        start_time: c.start_time,
        end_time: c.end_time,
      }))
    );

    if (clipFiles.length === 0) {
      throw new Error("Failed to generate any clip files");
    }

    console.log(`[Retry Generation] Generated ${clipFiles.length} clip files, uploading...`);

    const uploadResults = await uploadMultipleClips(userId, clipRequestId, clipFiles);

    const clipFilesMap = uploadResults.reduce(
      (acc, result) => {
        acc[result.clipId] = result.url;
        return acc;
      },
      {} as Record<string, string>
    );

    await supabase
      .from("clip_requests")
      .update({
        clip_files: clipFilesMap,
        status: "Completed",
      })
      .eq("id", clipRequestId);

    console.log(`[Retry Generation] Completed for ${clipRequestId}`);

    await cleanupTempFiles(clipRequestId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error(`[Retry Generation] Failed for ${clipRequestId}:`, errorMessage);

    await supabase
      .from("clip_requests")
      .update({
        status: "Failed",
        error_message: errorMessage,
      })
      .eq("id", clipRequestId);
  }
}
