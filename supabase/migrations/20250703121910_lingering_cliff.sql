/*
  # Subscription System Migration

  1. New Tables
    - `subscription_plans`: Store subscription plan details
    - `user_subscriptions`: Track user subscriptions
    - `subscription_usage`: Track feature usage per subscription

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for users and admins

  3. Functions
    - Add function to calculate subscription statistics
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  features TEXT[] NOT NULL DEFAULT '{}',
  stripe_price_id TEXT NOT NULL UNIQUE,
  trial_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subscription_usage table
CREATE TABLE IF NOT EXISTS subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('wallpaper_download', 'game_download')),
  usage_count INTEGER DEFAULT 0,
  limit_count INTEGER DEFAULT 999,
  reset_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plans
CREATE POLICY "Anyone can read active plans"
  ON subscription_plans
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage plans"
  ON subscription_plans
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND approved = true
  ));

-- Policies for user_subscriptions
CREATE POLICY "Users can read their own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND approved = true
  ));

CREATE POLICY "System can manage subscriptions"
  ON user_subscriptions
  FOR ALL
  TO service_role
  USING (true);

-- Policies for subscription_usage
CREATE POLICY "Users can read their own usage"
  ON subscription_usage
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own usage"
  ON subscription_usage
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all usage"
  ON subscription_usage
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND approved = true
  ));

-- Function to get subscription statistics
CREATE OR REPLACE FUNCTION get_subscription_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_subscribers', (
      SELECT COUNT(*) FROM user_subscriptions
    ),
    'active_subscribers', (
      SELECT COUNT(*) FROM user_subscriptions 
      WHERE status = 'active'
    ),
    'trial_subscribers', (
      SELECT COUNT(*) FROM user_subscriptions 
      WHERE status = 'trialing'
    ),
    'canceled_subscribers', (
      SELECT COUNT(*) FROM user_subscriptions 
      WHERE status = 'canceled'
    ),
    'monthly_revenue', (
      SELECT COALESCE(SUM(sp.price), 0)
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.status IN ('active', 'trialing')
      AND sp.interval = 'month'
    ),
    'yearly_revenue', (
      SELECT COALESCE(SUM(sp.price), 0)
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.status IN ('active', 'trialing')
      AND sp.interval = 'year'
    ),
    'churn_rate', (
      SELECT CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(
          (COUNT(*) FILTER (WHERE status = 'canceled')::DECIMAL / COUNT(*)) * 100, 2
        )
      END
      FROM user_subscriptions
      WHERE created_at >= NOW() - INTERVAL '30 days'
    ),
    'conversion_rate', (
      SELECT CASE 
        WHEN COUNT(*) FILTER (WHERE status = 'trialing') = 0 THEN 0
        ELSE ROUND(
          (COUNT(*) FILTER (WHERE status = 'active' AND trial_end IS NOT NULL)::DECIMAL / 
           COUNT(*) FILTER (WHERE status = 'trialing')) * 100, 2
        )
      END
      FROM user_subscriptions
    ),
    'popular_plan', (
      SELECT sp.name
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.status IN ('active', 'trialing')
      GROUP BY sp.id, sp.name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, interval, features, stripe_price_id, trial_days) VALUES
('Basic', 'Perfect for casual users', 9.99, 'month', ARRAY['Unlimited wallpaper downloads', 'Access to all quizzes', 'Basic game downloads'], 'price_basic_monthly', 7),
('Pro', 'Best for anime enthusiasts', 19.99, 'month', ARRAY['Everything in Basic', 'Premium wallpaper collections', 'Unlimited game downloads', 'Early access to new content'], 'price_pro_monthly', 14),
('Premium', 'Ultimate anime experience', 99.99, 'year', ARRAY['Everything in Pro', 'Exclusive content', 'Priority support', 'Custom requests'], 'price_premium_yearly', 30);

-- Remove use_locker columns from existing tables since we're using subscriptions now
ALTER TABLE wallpapers DROP COLUMN IF EXISTS use_locker;
ALTER TABLE quizzes DROP COLUMN IF EXISTS use_locker;
ALTER TABLE games DROP COLUMN IF EXISTS use_locker;

-- Drop unlock_sessions table as it's no longer needed
DROP TABLE IF EXISTS unlock_sessions CASCADE;

-- Drop global_settings locker settings as they're no longer needed
DELETE FROM global_settings WHERE key = 'locker_settings';