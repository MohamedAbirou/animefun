export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: string
  features: string[]
  stripe_price_id: string
  trial_days: number | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: string
  current_period_start: string
  current_period_end: string
  trial_start: string | null
  trial_end: string | null
  canceled_at: string | null
  created_at: string | null
  updated_at: string | null
  plan?: SubscriptionPlan
}

export interface SubscriptionUsage {
  id: string
  user_id: string
  subscription_id: string
  feature_type: string
  usage_count: number | null
  limit_count: number | null
  reset_date: string
  created_at: string | null
  updated_at: string | null
}

export interface SubscriptionStats {
  total_subscribers: number
  active_subscribers: number
  trial_subscribers: number
  canceled_subscribers: number
  monthly_revenue: number
  yearly_revenue: number
  churn_rate: number
  conversion_rate: number
  popular_plan: string
}