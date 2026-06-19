import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { cancelActiveProcesses, cleanupTempFiles } from "@/lib/video-processor";

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
    .select("id, status, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !clipRequest) {
    return NextResponse.json({ error: "Clip request not found" }, { status: 404 });
  }

  if (clipRequest.status !== "Processing") {
    return NextResponse.json(
      { error: "Can only cancel processing requests" },
      { status: 400 }
    );
  }

  const serviceSupabase = createServiceClient();

  cancelActiveProcesses(id);

  await serviceSupabase
    .from("clip_requests")
    .update({
      status: "Cancelled",
      processing_stage: null,
      error_message: null,
    })
    .eq("id", id);

  await cleanupTempFiles(id);

  return NextResponse.json({ message: "Processing cancelled successfully" });
}
