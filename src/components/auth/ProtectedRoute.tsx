import { ReactNode, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import LoadingScreen from '@/components/common/LoadingScreen'

interface ProtectedRouteProps {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAdmin, isApproved, isLoading, checkSession } = useAuthStore()
  
  // Check session when component mounts
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
  
  // Redirect to pending approval page if admin but not approved
  if (isAdmin && !isApproved) {
    return <Navigate to="/admin/pending-approval" replace />
  }
  
  // Ensure user is an admin
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }
  
  // User is authenticated and has the correct role
  return <>{children}</>
}

export default ProtectedRoute