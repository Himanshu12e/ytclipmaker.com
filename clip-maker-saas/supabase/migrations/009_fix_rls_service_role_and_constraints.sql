-- Fix RLS policies for service role access and status constraints
-- This migration ensures the service role can update clip_requests for
-- processing status changes, and adds proper policies for all operations.

-- 1. Ensure status constraint includes all valid states
ALTER TABLE clip_requests DROP CONSTRAINT IF EXISTS clip_requests_status_check;
ALTER TABLE clip_requests ADD CONSTRAINT clip_requests_status_check 
  CHECK (status IN ('Processing', 'Completed', 'Failed', 'Cancelled'));

-- 2. Add service role policies for clip_requests (needed for background processing)
-- The service role bypasses RLS, but we need explicit policies for the
-- anon key used in server-side operations

-- Allow service role to update clip_requests (for status updates during processing)
CREATE POLICY "Service role can update clip requests"
  ON clip_requests FOR UPDATE
  TO service_role
  USING (true);

-- Allow service role to insert clip_requests
CREATE POLICY "Service role can insert clip requests"
  ON clip_requests FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow service role to select clip_requests
CREATE POLICY "Service role can select clip requests"
  ON clip_requests FOR SELECT
  TO service_role
  USING (true);

-- 3. Add service role policies for profiles
CREATE POLICY "Service role can update profiles"
  ON profiles FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can select profiles"
  ON profiles FOR SELECT
  TO service_role
  USING (true);

-- 4. Ensure the clips storage bucket allows service role uploads
-- The existing policies use auth.uid() which won't work for service role
-- Add a service role bypass policy for storage
CREATE POLICY "Service role can upload clips"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'clips');

CREATE POLICY "Service role can view clips"
  ON storage.objects FOR SELECT
  TO service_role
  USING (bucket_id = 'clips');

CREATE POLICY "Service role can delete clips"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'clips');

-- 5. Add subtitle-related columns for future use
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS subtitle_style TEXT DEFAULT NULL;
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS subtitle_config JSONB DEFAULT NULL;

-- 6. Add plan feature columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subtitle_style TEXT DEFAULT 'basic';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_themes JSONB DEFAULT NULL;
