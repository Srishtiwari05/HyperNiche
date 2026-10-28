-- Persist campaign images/deliverable format, and public media bucket for avatars.

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS content_type VARCHAR(120);

INSERT INTO storage.buckets (id, name, public)
VALUES ('Media', 'Media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Do not CREATE POLICY on storage.objects here: the SQL editor is not the owner (42501).
-- Dashboard → Storage → Media → Policies:
--   INSERT TO authenticated WITH CHECK (
--     bucket_id = 'Media'
--     AND (storage.foldername(name))[2] = auth.uid()::text
--   );
-- Public downloads: keep the bucket Public. Skip a SELECT policy on objects.
