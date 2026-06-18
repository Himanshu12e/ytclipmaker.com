import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { video_url, video_title, thumbnail_url, channel_name } = await request.json();

  if (!video_url) {
    return NextResponse.json({ error: "Video URL is required" }, { status: 400 });
  }

  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/|music\.youtube\.com\/watch\?v=)[\w-]{11}(&[\w=-]*)?$/;
  if (!youtubeRegex.test(video_url)) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("free_clips_remaining")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  if (profile.free_clips_remaining <= 0) {
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
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Failed to create clip request" }, { status: 500 });
  }

  await supabase
    .from("profiles")
    .update({ free_clips_remaining: profile.free_clips_remaining - 1 })
    .eq("id", user.id);

  return NextResponse.json({
    clip_request: clipRequest,
    free_clips_remaining: profile.free_clips_remaining - 1,
  });
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("free_clips_remaining")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    clips,
    free_clips_remaining: profile?.free_clips_remaining ?? 15,
  });
}
