/*
  # Create Storage Buckets and Policies

  1. New Buckets
    - wallpapers: For storing wallpaper images
    - anime_series: For storing anime cover images
    - games: For storing game screenshots and APKs

  2. Security
    - Public read access for all buckets
    - Authenticated users can upload/update/delete
    - File size and type restrictions
*/

-- Create wallpapers bucket with all properties
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'wallpapers',
  'wallpapers',
  true,
  52428800, -- 50MB size limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif']::text[]
);

-- Create anime_series bucket with all properties
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'anime_series',
  'anime_series',
  true,
  52428800, -- 50MB size limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif']::text[]
);

-- Create games bucket with all properties
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'games',
  'games',
  true,
  104857600, -- 100MB size limit for APK files
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/vnd.android.package-archive']::text[]
);

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