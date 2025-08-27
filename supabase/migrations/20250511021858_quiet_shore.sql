/*
  # Add admin policies for anime series

  1. Security Changes
    - Add policies for admin users to manage anime series
    - Enable admin users to create, update, and delete anime series records
    - Create storage bucket for anime series covers

  2. Storage
    - Create anime_series bucket for storing cover images
*/

-- Add policies for admin CRUD operations on anime_series
CREATE POLICY "Enable admin insert" ON public.anime_series
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.approved = true
  ));

CREATE POLICY "Enable admin update" ON public.anime_series
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.approved = true
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.approved = true
  ));

CREATE POLICY "Enable admin delete" ON public.anime_series
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.approved = true
  ));

-- Create storage bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name)
  VALUES ('anime_series', 'anime_series')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Add storage policies for the anime_series bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'anime_series');

CREATE POLICY "Admin Insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'anime_series'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.approved = true
  )
);

CREATE POLICY "Admin Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'anime_series'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.approved = true
  )
)
WITH CHECK (
  bucket_id = 'anime_series'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.approved = true
  )
);

CREATE POLICY "Admin Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'anime_series'
  AND EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.approved = true
  )
);