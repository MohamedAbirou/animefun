/*
  # Storage Buckets and RLS Policies

  1. Storage Buckets
    - Create buckets for wallpapers, anime series, and games if they don't exist
    - Set appropriate file size limits and MIME types
    - Enable public access

  2. Security
    - Add storage policies for public access and authenticated operations
    - Set up RLS policies for wallpapers table
    - Restrict modifications to approved admins
*/

DO $$ 
BEGIN
  -- Create wallpapers bucket if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'wallpapers') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'wallpapers',
      'wallpapers',
      true,
      52428800, -- 50MB size limit
      ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif']::text[]
    );
  END IF;

  -- Create anime_series bucket if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'anime_series') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'anime_series',
      'anime_series',
      true,
      52428800, -- 50MB size limit
      ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif']::text[]
    );
  END IF;

  -- Create games bucket if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'games') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'games',
      'games',
      true,
      104857600, -- 100MB size limit for APK files
      ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/vnd.android.package-archive']::text[]
    );
  END IF;
END $$;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can update files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can delete files" ON storage.objects;

-- Set security policies for public access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('wallpapers', 'anime_series', 'games'));

-- Set security policies for authenticated uploads
CREATE POLICY "Authenticated Users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('wallpapers', 'anime_series', 'games'));

-- Set security policies for authenticated updates
CREATE POLICY "Authenticated Users can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('wallpapers', 'anime_series', 'games'));

-- Set security policies for authenticated deletes
CREATE POLICY "Authenticated Users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('wallpapers', 'anime_series', 'games'));

-- Enable RLS on wallpapers table
ALTER TABLE wallpapers ENABLE ROW LEVEL SECURITY;

-- Drop existing wallpapers policies if they exist
DROP POLICY IF EXISTS "Anyone can read wallpapers" ON wallpapers;
DROP POLICY IF EXISTS "Admins can insert wallpapers" ON wallpapers;
DROP POLICY IF EXISTS "Admins can update wallpapers" ON wallpapers;
DROP POLICY IF EXISTS "Admins can delete wallpapers" ON wallpapers;

-- Allow anyone to read wallpapers
CREATE POLICY "Anyone can read wallpapers"
ON wallpapers FOR SELECT
TO public
USING (true);

-- Allow authenticated admins to insert wallpapers
CREATE POLICY "Admins can insert wallpapers"
ON wallpapers FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM admin_profiles
  WHERE id = auth.uid()
  AND approved = true
));

-- Allow authenticated admins to update wallpapers
CREATE POLICY "Admins can update wallpapers"
ON wallpapers FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM admin_profiles
  WHERE id = auth.uid()
  AND approved = true
));

-- Allow authenticated admins to delete wallpapers
CREATE POLICY "Admins can delete wallpapers"
ON wallpapers FOR DELETE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM admin_profiles
  WHERE id = auth.uid()
  AND approved = true
));