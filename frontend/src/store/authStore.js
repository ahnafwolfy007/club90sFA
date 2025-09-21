// store/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'
import toast from 'react-hot-toast'

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/login', credentials)
          const { user, accessToken, refreshToken } = response.data.data

          // Store tokens
          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', refreshToken)

          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          })

          toast.success(`Welcome back, ${user.full_name}!`)
          return { success: true, user }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Login failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      signup: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await api.post('/auth/signup', userData)
          set({ isLoading: false })
          
          toast.success('Registration successful! Please wait for admin approval.')
          return { success: true, data: response.data.data }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Registration failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch (error) {
          console.error('Logout API error:', error)
        } finally {
          // Clear everything regardless of API response
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false
          })

          toast.success('Logged out successfully')
        }
      },

      refreshAuth: async () => {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          return false
        }

        try {
          const response = await api.post('/auth/refresh', { refreshToken })
          const { accessToken, refreshToken: newRefreshToken } = response.data.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefreshToken)

          set({
            accessToken,
            refreshToken: newRefreshToken
          })

          return true
        } catch (error) {
          // Refresh failed, logout user
          get().logout()
          return false
        }
      },

      updateProfile: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await api.put('/auth/profile', userData)
          const updatedUser = response.data.data.user

          set({
            user: updatedUser,
            isLoading: false
          })

          toast.success('Profile updated successfully')
          return { success: true, user: updatedUser }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Profile update failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      changePassword: async (passwordData) => {
        set({ isLoading: true })
        try {
          await api.put('/auth/change-password', passwordData)
          set({ isLoading: false })
          
          toast.success('Password changed successfully')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Password change failed'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      loadUser: async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          return false
        }

        set({ isLoading: true })
        try {
          const response = await api.get('/auth/me')
          const user = response.data.data.user

          set({
            user,
            accessToken: token,
            refreshToken: localStorage.getItem('refreshToken'),
            isAuthenticated: true,
            isLoading: false
          })

          return true
        } catch (error) {
          set({ isLoading: false })
          // Try to refresh token
          const refreshSuccess = await get().refreshAuth()
          if (refreshSuccess) {
            return get().loadUser()
          }
          return false
        }
      },

      // Utility functions
      hasRole: (roles) => {
        const { user } = get()
        if (!user) return false
        
        const userRole = user.role
        const allowedRoles = Array.isArray(roles) ? roles : [roles]
        return allowedRoles.includes(userRole)
      },

      isAdmin: () => {
        return get().hasRole(['admin', 'head_of_operations'])
      },

      isMod: () => {
        return get().hasRole(['mod', 'admin', 'head_of_operations'])
      },

      canManagePlayers: () => {
        return get().hasRole(['admin', 'head_of_operations', 'player_development'])
      },

      // Clear auth state (for errors)
      clearAuth: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export default useAuthStore