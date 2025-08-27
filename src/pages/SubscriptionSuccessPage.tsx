import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

const SubscriptionSuccessPage = () => {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // You could verify the session with Stripe here if needed
    console.log('Subscription successful, session:', sessionId)
  }, [sessionId])

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-8">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Premium!
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Your subscription has been activated successfully. You now have access to all premium features.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/subscription"
            className="btn btn-primary w-full"
          >
            View Subscription Details
          </Link>
          
          <Link
            to="/"
            className="btn btn-outline w-full"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionSuccessPage