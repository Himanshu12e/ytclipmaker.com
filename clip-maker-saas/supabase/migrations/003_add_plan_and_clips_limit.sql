-- Add plan and clips_limit columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS clips_limit INTEGER NOT NULL DEFAULT 15;

-- Update the trigger to include plan and clips_limit
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plan, clips_limit, free_clips_remaining)
  VALUES (new.id, new.email, 'free', 15, 15);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
