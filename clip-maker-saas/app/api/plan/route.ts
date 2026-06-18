import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PLAN_LIMITS: Record<string, number> = {
  free: 15,
  pro: 999999,
  enterprise: 999999,
};

export async function PUT(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await request.json();

  if (!plan || !PLAN_LIMITS.hasOwnProperty(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const clipsLimit = PLAN_LIMITS[plan];

  const { data: profile, error: selectError } = await supabase
    .from("profiles")
    .select("id, plan, clips_limit, free_clips_remaining")
    .eq("id", user.id)
    .single();

  if (selectError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {
    plan,
    clips_limit: clipsLimit,
    updated_at: new Date().toISOString(),
  };

  if (plan === "free") {
    updateData.clips_limit = 15;
    updateData.free_clips_remaining = Math.min(
      profile.free_clips_remaining,
      15
    );
  } else if (
    (plan === "pro" || plan === "enterprise") &&
    profile.plan === "free"
  ) {
    updateData.free_clips_remaining = clipsLimit;
  }

  const { data: updated, error: updateError } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)
    .select("id, email, plan, clips_limit, free_clips_remaining, created_at")
    .single();

  if (updateError) {
    console.error("[API /plan PUT] update error:", updateError.message);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }

  return NextResponse.json({ profile: updated });
}
