-- Add missing video_duration_seconds column to clip_requests
-- This column was referenced in application code (INSERT/UPDATE) but never created in the database,
-- causing PGRST204 "Could not find column in schema cache" errors on POST /api/clips.
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS video_duration_seconds INTEGER DEFAULT NULL;
