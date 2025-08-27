/*
  # Update Trial for Basic Plan Only

  1. Changes
    - Update existing plans to only have trial on Basic plan
    - Set trial_days to 0 for Pro and Premium plans
    - Keep 7-day trial only for Basic plan

  2. Security
    - Maintain existing RLS policies
*/

-- Update existing plans to remove trial from non-basic plans
UPDATE subscription_plans 
SET trial_days = 0, updated_at = now()
WHERE name != 'Basic';

-- Ensure Basic plan has the trial
UPDATE subscription_plans 
SET trial_days = 7, updated_at = now()
WHERE name = 'Basic';