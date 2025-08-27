/*
  # Add Character Details to Quizzes

  1. Changes:
    - Add character_details JSONB column to quizzes table
    - Add check constraint for valid character data
    - Add example quiz with character details

  2. Security:
    - Maintain existing RLS policies
    - Ensure data integrity with constraints
*/

-- First, ensure the questions column exists and has the correct type
ALTER TABLE quizzes 
ALTER COLUMN questions SET DATA TYPE jsonb USING questions::jsonb;

-- Add character details to questions structure
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS character_details jsonb DEFAULT '{}'::jsonb;

-- Add check constraint to ensure valid character data structure
ALTER TABLE quizzes
ADD CONSTRAINT valid_character_details
CHECK (
  character_details IS NULL 
  OR (
    jsonb_typeof(character_details) = 'object'
    AND character_details != '{}'::jsonb
    AND character_details != 'null'::jsonb
  )
);

-- Create a function to validate character details structure
CREATE OR REPLACE FUNCTION validate_character_details()
RETURNS trigger AS $$
BEGIN
  -- Check each character entry has required fields
  IF NEW.character_details IS NOT NULL THEN
    FOR value IN SELECT value FROM jsonb_each(NEW.character_details) LOOP
      IF NOT (
        value->>'name' IS NOT NULL
        AND value->>'image' IS NOT NULL
        AND value->>'description' IS NOT NULL
        AND jsonb_typeof(value->'traits') = 'array'
        AND jsonb_typeof(value->'funFacts') = 'array'
      ) THEN
        RAISE EXCEPTION 'Invalid character details structure';
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate character details on insert/update
DROP TRIGGER IF EXISTS validate_character_details_trigger ON quizzes;
CREATE TRIGGER validate_character_details_trigger
  BEFORE INSERT OR UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION validate_character_details();

-- Add example quiz with character details
INSERT INTO quizzes (
  title,
  description,
  min_questions,
  max_questions,
  questions,
  character_details,
  use_locker
) VALUES (
  'Example Personality Quiz',
  'Find out which character matches your personality!',
  5,
  10,
  '[
    {
      "id": "q1",
      "question": "What would you do in a difficult situation?",
      "options": [
        {
          "text": "Face it head on",
          "character": "hero"
        },
        {
          "text": "Think carefully before acting",
          "character": "strategist"
        }
      ]
    }
  ]'::jsonb,
  '{
    "hero": {
      "name": "The Hero",
      "image": "https://example.com/hero.jpg",
      "description": "A brave and determined character who never gives up.",
      "traits": ["Brave", "Determined", "Loyal"],
      "funFacts": [
        "Always puts others first",
        "Has a secret fear of heights",
        "Loves spicy food"
      ]
    },
    "strategist": {
      "name": "The Strategist",
      "image": "https://example.com/strategist.jpg",
      "description": "A brilliant mind who can solve any puzzle.",
      "traits": ["Intelligent", "Analytical", "Resourceful"],
      "funFacts": [
        "Can solve a Rubiks cube in under a minute",
        "Collects rare books",
        "Never leaves home without a backup plan"
      ]
    }
  }'::jsonb,
  true
);