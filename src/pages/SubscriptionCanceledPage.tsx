import { Link } from 'react-router-dom'
import { XCircleIcon } from '@heroicons/react/24/outline'

const SubscriptionCanceledPage = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg p-8">
        <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Subscription Canceled
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Your subscription process was canceled. You can try again anytime.
        </p>
        
        <div className="space-y-4">
          <Link
            to="/subscription"
            className="btn btn-primary w-full"
          >
            Try Again
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

export default SubscriptionCanceledPage