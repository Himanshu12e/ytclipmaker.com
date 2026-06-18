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

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("free_clips_remaining, clips_limit, plan")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("[API /clips POST] profile select error:", profileError.message, profileError.code);
  }

  if (profileError || !profile) {
    console.log("[API /clips POST] No profile found for user", user.id, "- attempting to create");

    const { error: insertErr } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      plan: "free",
      clips_limit: 15,
      free_clips_remaining: 15,
    });

    if (insertErr) {
      console.error("[API /clips POST] profile insert error:", insertErr.message, insertErr.code, insertErr.details);
      return NextResponse.json({ error: "Failed to create profile", details: insertErr.message }, { status: 500 });
    }

    const { data: newProfile, error: refetchErr } = await supabase
      .from("profiles")
      .select("free_clips_remaining, clips_limit, plan")
      .eq("id", user.id)
      .single();

    if (refetchErr) {
      console.error("[API /clips POST] profile refetch error:", refetchErr.message);
      return NextResponse.json({ error: "Failed to load new profile", details: refetchErr.message }, { status: 500 });
    }

    profile = newProfile;
  }

  if (!profile) {
    console.error("[API /clips POST] Profile still null after creation attempt for user", user.id);
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

  let { data: profile } = await supabase
    .from("profiles")
    .select("free_clips_remaining, clips_limit, plan")
    .eq("id", user.id)
    .single();

  if (!profile) {
    console.log("[API /clips GET] No profile found for user", user.id, "- attempting to create");

    const { error: insertErr } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      plan: "free",
      clips_limit: 15,
      free_clips_remaining: 15,
    });

    if (insertErr) {
      console.error("[API /clips GET] profile insert error:", insertErr.message, insertErr.code, insertErr.details);
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
