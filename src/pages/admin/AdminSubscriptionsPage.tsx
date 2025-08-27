import AddEditPlanModal from '@/components/admin/AddEditPlanModal'
import { supabase } from '@/lib/supabase'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { SubscriptionPlan, UserSubscription } from '@/types/subscription'
import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

const AdminSubscriptionsPage = () => {
  const { plans, stats, fetchPlans, fetchStats, deletePlan } = useSubscriptionStore()
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    await Promise.all([
      fetchPlans(),
      fetchStats(),
      loadSubscriptions()
    ])
    setIsLoading(false)
  }

  const loadSubscriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*), users(email)')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setSubscriptions(data as any)
    } catch (error) {
      console.error('Error loading subscriptions:', error)
    }
  }

  const handleDeletePlan = async (id: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      await deletePlan(id)
    }
  }

  const statsCards = [
    {
      name: 'Total Subscribers',
      value: stats?.total_subscribers || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Subscribers',
      value: stats?.active_subscribers || 0,
      icon: ArrowTrendingUpIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Monthly Revenue',
      value: `$${stats?.monthly_revenue || 0}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Conversion Rate',
      value: `${stats?.conversion_rate || 0}%`,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Subscription Management
        </h1>
        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary"
        >
          Add New Plan
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-dark-card rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Plans */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Subscription Plans
          </h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        ${plan.price}/{plan.interval}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      plan.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {plan.description}
                  </p>
                  
                  {plan.trial_days ? plan.trial_days > 0 && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                      {plan.trial_days} days free trial
                    </p>
                  ) : (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                      Free trial unavailable
                    </p>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedPlan(plan)}
                      className="btn btn-outline btn-sm flex-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="btn btn-outline btn-sm text-red-600 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Subscriptions */}
      <div className="bg-white dark:bg-dark-card rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Subscriptions
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Period End
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-card divide-y divide-gray-200 dark:divide-gray-700">
              {subscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {(subscription as any).users?.email || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {subscription.plan?.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ${subscription.plan?.price}/{subscription.plan?.interval}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      subscription.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : subscription.status === 'trialing'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {subscription.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(subscription.created_at as any).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditPlanModal
        isOpen={isCreating || !!selectedPlan}
        onClose={() => {
          setIsCreating(false)
          setSelectedPlan(null)
        }}
        plan={selectedPlan}
        onSuccess={loadData}
      />
    </div>
  )
}

export default AdminSubscriptionsPage