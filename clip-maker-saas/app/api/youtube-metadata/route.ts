import { NextRequest, NextResponse } from "next/server";
import { extractVideoId, getThumbnailUrl } from "@/lib/youtube";

export async function POST(request: NextRequest) {
  const { url } = await request.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oembedRes = await fetch(oembedUrl);

    if (!oembedRes.ok) {
      return NextResponse.json(
        { error: "Could not fetch video metadata" },
        { status: 502 }
      );
    }

    const oembedData = await oembedRes.json();

    return NextResponse.json({
      video_id: videoId,
      title: oembedData.title ?? "Unknown Title",
      thumbnail_url: getThumbnailUrl(videoId),
      channel_name: oembedData.author_name ?? "Unknown Channel",
      youtube_url: url,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch video metadata" },
      { status: 500 }
    );
  }
}
