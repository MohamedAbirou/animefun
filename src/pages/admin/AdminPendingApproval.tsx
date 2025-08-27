import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import LoadingScreen from '@/components/common/LoadingScreen'

const AdminPendingApproval = () => {
  const { user, isLoading, isAdmin, isApproved, checkSession, logout } = useAuthStore()
  
  useEffect(() => {
    checkSession()
  }, [checkSession])
  
  if (isLoading) {
    return <LoadingScreen message="Checking status..." />
  }
  
  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/admin/login" replace />
  }
  
  // If approved, redirect to admin dashboard
  if (isAdmin && isApproved) {
    return <Navigate to="/admin" replace />
  }
  
  // If not an admin at all, redirect to login
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="/favicon.svg"
          alt="AnimeFun"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Account Pending Approval
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-dark-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Your admin account is pending approval
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    Thank you for registering. Your account needs to be approved by an existing admin before you can access the dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <p className="text-center text-gray-700 dark:text-gray-300">
              Please check back later or contact the site administrator for approval status.
            </p>
          </div>
          
          <div className="mt-6 flex flex-col space-y-4">
            <button
              onClick={() => logout()}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-sidebar hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
            >
              Sign Out
            </button>
            
            <Link
              to="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900"
            >
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPendingApproval