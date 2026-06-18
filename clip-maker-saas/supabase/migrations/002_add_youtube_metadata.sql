-- Add YouTube metadata columns to clip_requests
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS video_title TEXT;
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS channel_name TEXT;
