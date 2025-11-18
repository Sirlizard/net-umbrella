-- Add avatar_url column to friends to support storing an avatar image URL or storage path
BEGIN;

ALTER TABLE IF EXISTS friends
ADD COLUMN IF NOT EXISTS avatar_url text;

COMMIT;

-- Note: This migration adds a nullable `avatar_url` column to the `friends` table.
-- Uploading files to Supabase Storage and creating a public URL is handled by the application code.
-- To serve images from Supabase Storage, create a bucket (for example `avatars`) in the Supabase dashboard
-- and ensure appropriate public rules are set, or generate signed URLs from server-side functions.
