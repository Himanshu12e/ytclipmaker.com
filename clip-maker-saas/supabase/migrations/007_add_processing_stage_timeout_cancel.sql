-- Add processing stage and timeout tracking columns
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS processing_stage TEXT DEFAULT NULL;
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS clips_generated INTEGER DEFAULT 0;
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS video_duration_seconds INTEGER DEFAULT NULL;
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'youtube_shorts';
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS clip_length TEXT DEFAULT 'auto';
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ DEFAULT NULL;

-- Update status check constraint to include Cancelled
ALTER TABLE clip_requests DROP CONSTRAINT IF EXISTS clip_requests_status_check;
ALTER TABLE clip_requests ADD CONSTRAINT clip_requests_status_check CHECK (status IN ('Processing', 'Completed', 'Failed', 'Cancelled'));
