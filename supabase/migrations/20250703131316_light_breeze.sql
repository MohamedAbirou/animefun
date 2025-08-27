/*
  # Add foreign key relationship between user_subscriptions and users tables

  1. Changes
    - Add foreign key constraint from user_subscriptions.user_id to users.id
    - This enables proper joins between subscription data and user profiles

  2. Security
    - No changes to existing RLS policies
    - Maintains data integrity with proper referential constraints
*/

-- Add foreign key constraint between user_subscriptions and users tables
ALTER TABLE user_subscriptions 
ADD CONSTRAINT user_subscriptions_users_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;