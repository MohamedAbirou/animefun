import { Outlet, Navigate } from 'react-router-dom'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'
import LoadingScreen from '@/components/common/LoadingScreen'

const AdminLayout = () => {
  const { user, isAdmin, isApproved, isLoading, checkSession } = useAuthStore()
  
  // Check session on component mount
  useEffect(() => {
    checkSession()
  }, [checkSession])
  
  // Show loading screen while checking auth
  if (isLoading) {
    return <LoadingScreen message="Checking authorization..." />
  }
  
  // Redirect to login if not logged in
  if (!user) {
    return <Navigate to="/admin/login" replace />
  }
  
  // Redirect to pending approval page
  if (isAdmin && !isApproved) {
    return <Navigate to="/admin/pending-approval" replace />
  }
  
  // Ensure user is an admin
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-dark-bg transition-colors duration-200">
      <AdminSidebar />
      
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <AdminHeader />
        
        <main className="relative flex-1 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout