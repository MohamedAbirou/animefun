/*
  # Add Pack Counts to Wallpapers

  1. Changes:
    - Add pack_counts JSONB field to wallpapers table
    - Update RLS policies to include new field
    - Add check constraint for valid counts

  2. Security:
    - Maintain existing RLS policies
    - Ensure data integrity with constraints
*/

-- Add pack_counts field to wallpapers table
ALTER TABLE wallpapers 
ADD COLUMN pack_counts JSONB DEFAULT '{
  "main_count": 0,
  "desktop_count": 0,
  "mobile_count": 0,
  "desktop_sketchy_count": 0,
  "mobile_sketchy_count": 0
}'::jsonb;

-- Add constraint to ensure valid counts
ALTER TABLE wallpapers
ADD CONSTRAINT valid_pack_counts CHECK (
  (pack_counts->>'main_count')::int >= 0 AND
  (pack_counts->>'desktop_count')::int >= 0 AND
  (pack_counts->>'mobile_count')::int >= 0 AND
  (pack_counts->>'desktop_sketchy_count')::int >= 0 AND
  (pack_counts->>'mobile_sketchy_count')::int >= 0
);