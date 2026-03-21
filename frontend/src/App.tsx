import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AuthenticationPage from './pages/AuthenticationPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import { useAuth } from './services/AuthProvider'

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { isAuthenticated, isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return <p>Loading...</p>
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthenticationPage />} />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
