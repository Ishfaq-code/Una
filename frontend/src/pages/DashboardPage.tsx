import { useNavigate } from 'react-router'

import { useAuth } from '../context/useAuth'

function resolveDisplayName(firstName?: string, lastName?: string) {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  return fullName
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const displayName = resolveDisplayName(user?.first_name, user?.last_name)

  const handleLogout = () => {
    logout()
    navigate('/auth', { replace: true })
  }

  return (
    <main className="screen shell">
      <section className="panel">
        <h1 className="title">Dashboard</h1>
        <p className="subtitle">Welcome back.</p>

        <div className="user-card">
          <span className="label">Name</span>
          <strong>{displayName || user?.email || 'Unknown User'}</strong>
        </div>

        <button type="button" onClick={handleLogout} className="button button-secondary">
          Log out
        </button>
      </section>
    </main>
  )
}
