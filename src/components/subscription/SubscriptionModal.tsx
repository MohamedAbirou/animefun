import { createCheckoutSession, stripe } from '@/lib/stripe'
import { useAuthStore } from '@/store/authStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Fragment, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  feature?: string
}

export default function SubscriptionModal({ isOpen, onClose, feature }: Props) {
  const { plans, fetchPlans, isLoading } = useSubscriptionStore()
  const { user } = useAuthStore()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchPlans()
    }
  }, [isOpen, fetchPlans])

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast.error('Please log in to subscribe')
      return
    }

    try {
      setIsProcessing(true)
      setSelectedPlan(priceId)

      const sessionId = await createCheckoutSession(priceId, user.id)
      const stripeInstance = await stripe

      if (!stripeInstance) {
        throw new Error('Stripe not loaded')
      }

      const { error } = await stripeInstance.redirectToCheckout({
        sessionId,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      toast.error('Failed to start subscription process')
    } finally {
      setIsProcessing(false)
      setSelectedPlan(null)
    }
  }

  // Sort plans by price to ensure Basic (cheapest) comes first
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price)

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 dark:text-white">
                    Choose Your Plan
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {feature && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200">
                      Unlock premium features to access {feature}
                    </p>
                  </div>
                )}

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedPlans.map((plan) => {
                      const isBasicPlan = plan.name.toLowerCase() === 'basic'
                      const hasFreeTrial = plan.trial_days ? (isBasicPlan && plan.trial_days > 0) : false
                      
                      return (
                        <div
                          key={plan.id}
                          className={`relative bg-white dark:bg-gray-700 rounded-lg border-2 p-6 hover:border-primary-500 transition-colors ${
                            isBasicPlan 
                              ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800' 
                              : 'border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          {isBasicPlan && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                Most Popular
                              </span>
                            </div>
                          )}
                          
                          <div className="text-center">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                              {plan.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {plan.description}
                            </p>
                            <div className="mb-6">
                              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                ${plan.price}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                /{plan.interval}
                              </span>
                            </div>
                            
                            {hasFreeTrial && (
                              <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                <span className="text-green-800 dark:text-green-200 text-sm font-medium">
                                  🎉 {plan.trial_days} days FREE trial
                                </span>
                                <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                                  No commitment, cancel anytime
                                </p>
                              </div>
                            )}

                            <ul className="text-left space-y-2 mb-6">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                  <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>

                            <button
                              onClick={() => handleSubscribe(plan.stripe_price_id)}
                              disabled={isProcessing && selectedPlan === plan.stripe_price_id}
                              className={`w-full btn transition-all ${
                                isBasicPlan 
                                  ? 'btn-primary shadow-lg transform hover:scale-105' 
                                  : 'btn-outline'
                              }`}
                            >
                              {isProcessing && selectedPlan === plan.stripe_price_id
                                ? 'Processing...'
                                : hasFreeTrial
                                ? 'Start Free Trial'
                                : 'Subscribe Now'
                              }
                            </button>
                            
                            {hasFreeTrial && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Then ${plan.price}/{plan.interval} after trial
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    💡 <strong>Pro tip:</strong> Start with our Basic plan's free trial to explore all features risk-free!
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}