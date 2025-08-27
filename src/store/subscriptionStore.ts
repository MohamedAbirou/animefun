import { supabase } from '@/lib/supabase'
import { SubscriptionPlan, SubscriptionStats, SubscriptionUsage, UserSubscription } from '@/types/subscription'
import toast from 'react-hot-toast'
import { create } from 'zustand'

interface SubscriptionState {
  plans: SubscriptionPlan[]
  userSubscription: UserSubscription | null
  usage: SubscriptionUsage[]
  stats: SubscriptionStats | null
  isLoading: boolean

  // User functions
  fetchPlans: () => Promise<void>
  fetchUserSubscription: (userId: string) => Promise<void>
  fetchUsage: (userId: string) => Promise<void>
  checkFeatureAccess: (feature: string) => boolean
  incrementUsage: (feature: string) => Promise<boolean>

  // Admin functions
  fetchStats: () => Promise<void>
  createPlan: (plan: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>
  updatePlan: (id: string, updates: Partial<SubscriptionPlan>) => Promise<boolean>
  deletePlan: (id: string) => Promise<boolean>
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plans: [],
  userSubscription: null,
  usage: [],
  stats: null,
  isLoading: false,

  fetchPlans: async () => {
    try {
      set({ isLoading: true })

      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price')

      if (error) throw error

      set({ plans: data || [] })
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast.error('Failed to load subscription plans')
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUserSubscription: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') throw error

      set({ userSubscription: data || null })
    } catch (error) {
      console.error('Error fetching user subscription:', error)
    }
  },

  fetchUsage: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscription_usage')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error

      set({ usage: data || [] })
    } catch (error) {
      console.error('Error fetching usage:', error)
    }
  },

  checkFeatureAccess: () => {
    const { userSubscription } = get()
    
    if (!userSubscription) return false
    
    const now = new Date()
    const periodEnd = new Date(userSubscription.current_period_end)
    
    return userSubscription.status === 'active' && now <= periodEnd
  },

  incrementUsage: async (feature: string) => {
    const { userSubscription, usage } = get()
    
    if (!userSubscription) return false
    
    try {
      const currentUsage = usage.find(u => u.feature_type === feature as any)
      const newCount = (currentUsage?.usage_count || 0) + 1
      
      if (currentUsage) {
        const { error } = await supabase
          .from('subscription_usage')
          .update({ usage_count: newCount })
          .eq('id', currentUsage.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('subscription_usage')
          .insert({
            user_id: userSubscription.user_id,
            subscription_id: userSubscription.id,
            feature_type: feature,
            usage_count: 1,
            limit_count: 999, // Unlimited for now
            reset_date: new Date(userSubscription.current_period_end).toISOString()
          })
        
        if (error) throw error
      }
      
      // Refresh usage
      get().fetchUsage(userSubscription.user_id)
      return true
    } catch (error) {
      console.error('Error incrementing usage:', error)
      return false
    }
  },

  fetchStats: async () => {
    try {
      set({ isLoading: true })

      const { data, error } = await supabase.rpc('get_subscription_stats' as never)

      if (error) throw error

      set({ stats: data })
    } catch (error) {
      console.error('Error fetching subscription stats:', error)
      toast.error('Failed to load subscription statistics')
    } finally {
      set({ isLoading: false })
    }
  },

  createPlan: async (plan) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .insert(plan)

      if (error) throw error

      toast.success('Subscription plan created successfully')
      get().fetchPlans()
      return true
    } catch (error) {
      console.error('Error creating plan:', error)
      toast.error('Failed to create subscription plan')
      return false
    }
  },

  updatePlan: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      toast.success('Subscription plan updated successfully')
      get().fetchPlans()
      return true
    } catch (error) {
      console.error('Error updating plan:', error)
      toast.error('Failed to update subscription plan')
      return false
    }
  },

  deletePlan: async (id) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Subscription plan deleted successfully')
      get().fetchPlans()
      return true
    } catch (error) {
      console.error('Error deleting plan:', error)
      toast.error('Failed to delete subscription plan')
      return false
    }
  },
}))