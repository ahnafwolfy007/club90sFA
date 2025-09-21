// hooks/useAuth.js
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export const useAuth = () => {
  const authStore = useAuthStore()
  
  return {
    ...authStore,
    isLoading: authStore.isLoading
  }
}

// Hook for protecting routes
export const useAuthGuard = (requiredRoles = null, redirectTo = '/login') => {
  const { isAuthenticated, user, hasRole, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate(redirectTo, { 
          state: { from: location.pathname },
          replace: true 
        })
        return
      }

      if (requiredRoles && !hasRole(requiredRoles)) {
        navigate('/unauthorized', { replace: true })
        return
      }
    }
  }, [isAuthenticated, user, isLoading, hasRole, navigate, location, redirectTo, requiredRoles])

  return {
    isAuthenticated,
    user,
    isLoading,
    hasAccess: !requiredRoles || hasRole(requiredRoles)
  }
}

// Hook for admin routes
export const useAdminGuard = () => {
  return useAuthGuard(['admin', 'head_of_operations'], '/dashboard')
}

// Hook for mod routes
export const useModGuard = () => {
  return useAuthGuard(['mod', 'admin', 'head_of_operations'], '/dashboard')
}

// Hook for initializing auth state
export const useAuthInit = () => {
  const { loadUser, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      loadUser()
    }
  }, [loadUser, isAuthenticated, isLoading])

  return { isLoading }
}