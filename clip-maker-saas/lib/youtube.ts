export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtu\.be\/|music\.youtube\.com\/watch\?v=)([\w-]{11})/,
    /^([\w-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export interface YouTubeMetadata {
  video_id: string;
  title: string;
  thumbnail_url: string;
  channel_name: string;
  youtube_url: string;
}
