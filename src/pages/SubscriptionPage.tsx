import SubscriptionModal from '@/components/subscription/SubscriptionModal'
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus'
import { useAuthStore } from '@/store/authStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useEffect, useState } from 'react'

const SubscriptionPage = () => {
  const { user } = useAuthStore()
  const { fetchPlans } = useSubscriptionStore()
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchPlans()
  }, [fetchPlans])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Please log in to view your subscription
        </h2>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Subscription
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SubscriptionStatus />
        
        <div className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Plans
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Upgrade your plan to unlock premium features and unlimited access.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary w-full"
          >
            View Plans
          </button>
        </div>
      </div>

      <SubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  )
}

export default SubscriptionPage