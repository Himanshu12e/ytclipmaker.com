-- Add clip_files column to store MP4 clip URLs
ALTER TABLE clip_requests ADD COLUMN IF NOT EXISTS clip_files JSONB;

-- Create storage bucket for generated clips
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('clips', 'clips', true, 104857600, ARRAY['video/mp4', 'video/webm', 'video/quicktime'])
ON CONFLICT (id) DO NOTHING;

-- RLS policies for clips bucket
CREATE POLICY "Users can upload clips" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'clips' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own clips" ON storage.objects
  FOR SELECT USING (bucket_id = 'clips' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view public clips" ON storage.objects
  FOR SELECT USING (bucket_id = 'clips');

CREATE POLICY "Users can delete their own clips" ON storage.objects
  FOR DELETE USING (bucket_id = 'clips' AND auth.uid()::text = (storage.foldername(name))[1]);
