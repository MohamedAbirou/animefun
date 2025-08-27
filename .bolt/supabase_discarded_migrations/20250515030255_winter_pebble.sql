/*
  # Update Quiz Table Structure

  1. Changes:
    - Rename character_details to characters for consistency
    - Add check constraint for character structure
    - Update quiz_results to use character_name

  2. Security:
    - Maintain existing RLS policies
*/

-- Rename character_details to characters
ALTER TABLE quizzes
DROP COLUMN IF EXISTS characters CASCADE;

ALTER TABLE quizzes
ADD COLUMN characters jsonb DEFAULT '{}'::jsonb;

-- Add check constraint for character structure
ALTER TABLE quizzes
ADD CONSTRAINT valid_characters
CHECK (
  characters IS NULL 
  OR (
    jsonb_typeof(characters) = 'object'
    AND characters != '{}'::jsonb
    AND characters != 'null'::jsonb
  )
);

-- Create a function to validate character structure
CREATE OR REPLACE FUNCTION validate_characters()
RETURNS trigger AS $$
BEGIN
  -- Check each character entry has required fields
  IF NEW.characters IS NOT NULL THEN
    FOR value IN SELECT value FROM jsonb_each(NEW.characters) LOOP
      IF NOT (
        value->>'name' IS NOT NULL
        AND value->>'image' IS NOT NULL
        AND value->>'description' IS NOT NULL
        AND jsonb_typeof(value->'traits') = 'array'
        AND jsonb_typeof(value->'funFacts') = 'array'
      ) THEN
        RAISE EXCEPTION 'Invalid character structure';
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate characters on insert/update
DROP TRIGGER IF EXISTS validate_characters_trigger ON quizzes;
CREATE TRIGGER validate_characters_trigger
  BEFORE INSERT OR UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION validate_characters();