import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: initialProfile, error: selectError } = await supabase
    .from("profiles")
    .select("id, email, plan, clips_limit, free_clips_remaining, created_at")
    .eq("id", user.id)
    .single();

  let profile = initialProfile;

  if (selectError) {
    console.error("[API /profile GET] select error:", selectError.message);
  }

  if (!profile) {
    console.log("[API /profile GET] No profile found for user", user.id, "- creating one");

    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email ?? "",
      plan: "free",
      clips_limit: 15,
      free_clips_remaining: 15,
    });

    if (insertError) {
      console.error("[API /profile GET] insert error:", insertError.message, insertError.code, insertError.details);
      return NextResponse.json({ error: "Failed to create profile", details: insertError.message }, { status: 500 });
    }

    const { data: newProfile, error: refetchError } = await supabase
      .from("profiles")
      .select("id, email, plan, clips_limit, free_clips_remaining, created_at")
      .eq("id", user.id)
      .single();

    if (refetchError) {
      console.error("[API /profile GET] refetch error:", refetchError.message);
      return NextResponse.json({ error: "Failed to load new profile", details: refetchError.message }, { status: 500 });
    }

    profile = newProfile;
  }

  return NextResponse.json({ profile });
}

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ profile: existing });
  }

  console.log("[API /profile POST] Creating profile for user", user.id);

  const { data: profile, error: insertError } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email ?? "",
      plan: "free",
      clips_limit: 15,
      free_clips_remaining: 15,
    })
    .select("id, email, plan, clips_limit, free_clips_remaining, created_at")
    .single();

  if (insertError) {
    console.error("[API /profile POST] insert error:", insertError.message, insertError.code, insertError.details);
    return NextResponse.json({ error: "Failed to create profile", details: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ profile });
}
