// App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'

// Pages
import { LandingPage } from './pages/LandingPage'
import { Login } from './pages/auth/Login'
import { Signup } from './pages/auth/Signup'
import { SignupSuccess } from './pages/auth/SignupSuccess'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'
import PlayerDashboard from './pages/dashboard/PlayerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import EngagementDashboard from './pages/admin/EngagementDashboard'
import PlayerProfile from './pages/admin/PlayerProfile'
import MatchesManager from './pages/admin/MatchesManager'
import PlayersList from './pages/admin/PlayersList'

// Layout Components
import { PageTransition } from './components/animations/PageTransition'

// Hooks
import { useAuth } from './hooks/useAuth'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gold-400"></div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gold-400"></div>
      </div>
    )
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
}

// Dashboard now routes to PlayerDashboard

function App() {
  // Set tab title and favicon
  React.useEffect(() => {
    document.title = 'Club 90s Football Academy'
    const setFavicon = (href) => {
      let link = document.querySelector("link[rel='icon'][type='image/png']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        link.type = 'image/svg+xml'
        document.head.appendChild(link)
      }
      link.href = process.env.PUBLIC_URL + '/favicon.svg'
    }
    setFavicon()
  }, [])

  return (
    <Router>
      <div className="App">
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#ffffff',
              border: '1px solid #d4af37',
            },
            success: {
              iconTheme: {
                primary: '#d4af37',
                secondary: '#1a1a1a',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#1a1a1a',
              },
            },
          }}
        />

        {/* Main Routes */}
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Authentication Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } 
            />
            <Route 
              path="/auth/signup-success" 
              element={
                <PublicRoute>
                  <SignupSuccess />
                </PublicRoute>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <PlayerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/engagement" 
              element={
                <ProtectedRoute>
                  <EngagementDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/players/:id" 
              element={
                <ProtectedRoute>
                  <PlayerProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/players" 
              element={
                <ProtectedRoute>
                  <PlayersList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/matches" 
              element={
                <ProtectedRoute>
                  <MatchesManager />
                </ProtectedRoute>
              } 
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  )
}

export default App