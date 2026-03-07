import { useEffect } from 'react'
import { Navigate } from 'react-router'
import type { ReactNode } from 'react'

import { useAuth } from '../context/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { accessToken, refreshToken, isAuthenticated, isBootstrapping, logout } = useAuth()

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated && (accessToken || refreshToken)) {
      logout()
    }
  }, [accessToken, isAuthenticated, isBootstrapping, logout, refreshToken])

  if (isBootstrapping) {
    return <div className="app-loading">Loading session...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
