-- Add columns for AI-generated clip data
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS generated_clips JSONB;
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS transcript TEXT;
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Update status check to include 'Failed'
ALTER TABLE clip_requests DROP CONSTRAINT IF EXISTS clip_requests_status_check;
ALTER TABLE clip_requests ADD CONSTRAINT clip_requests_status_check CHECK (status IN ('Processing', 'Completed', 'Failed'));

-- Add UPDATE policy for clip_requests (needed for server-side status updates)
CREATE POLICY "Users can update own clip requests"
  ON clip_requests FOR UPDATE
  USING (auth.uid() = user_id);
