import { useEffect } from 'react'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useAuthStore } from '@/store/authStore'
import { createPortalSession } from '@/lib/stripe'
import toast from 'react-hot-toast'

export default function SubscriptionStatus() {
  const { userSubscription, usage, fetchUserSubscription, fetchUsage } = useSubscriptionStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      fetchUserSubscription(user.id)
      fetchUsage(user.id)
    }
  }, [user, fetchUserSubscription, fetchUsage])

  const handleManageSubscription = async () => {
    if (!userSubscription?.stripe_customer_id) {
      toast.error('No subscription found')
      return
    }

    try {
      const url = await createPortalSession(userSubscription.stripe_customer_id)
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error opening customer portal:', error)
      toast.error('Failed to open subscription management')
    }
  }

  if (!userSubscription) {
    return (
      <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Subscription Status
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You don't have an active subscription. Subscribe to unlock premium features.
        </p>
      </div>
    )
  }

  const isTrialing = userSubscription.status === 'trialing'
  const trialEndsAt = userSubscription.trial_end ? new Date(userSubscription.trial_end) : null
  const periodEndsAt = new Date(userSubscription.current_period_end)

  return (
    <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Subscription Status
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          userSubscription.status === 'active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : userSubscription.status === 'trialing'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {userSubscription.status.charAt(0).toUpperCase() + userSubscription.status.slice(1)}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">
            {userSubscription.plan?.name}
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            ${userSubscription.plan?.price}/{userSubscription.plan?.interval}
          </p>
        </div>

        {isTrialing && trialEndsAt && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-blue-800 dark:text-blue-200 text-sm">
              Trial ends on {trialEndsAt.toLocaleDateString()}
            </p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isTrialing ? 'Trial ends' : 'Next billing'}: {periodEndsAt.toLocaleDateString()}
          </p>
        </div>

        {usage.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Usage</h5>
            <div className="space-y-2">
              {usage.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.feature_type.replace('_', ' ')}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {item.usage_count} / {item.limit_count === 999 ? '∞' : item.limit_count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleManageSubscription}
          className="w-full btn btn-outline"
        >
          Manage Subscription
        </button>
      </div>
    </div>
  )
}