import { useMemo, useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { useAuth } from '../context/useAuth'
import type { ApiError } from '../lib/api'

type AuthMode = 'login' | 'signup'

interface LoginFormState {
  email: string
  password: string
}

interface SignupFormState {
  email: string
  password: string
  re_password: string
  first_name: string
  last_name: string
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    'fieldErrors' in error
  )
}

export function AuthPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isBootstrapping, login, signup } = useAuth()

  const [mode, setMode] = useState<AuthMode>('login')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [loginForm, setLoginForm] = useState<LoginFormState>({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState<SignupFormState>({
    email: '',
    password: '',
    re_password: '',
    first_name: '',
    last_name: '',
  })

  const heading = useMemo(() => {
    if (mode === 'login') {
      return 'Sign in to Una'
    }

    return 'Create your Una account'
  }, [mode])

  if (isBootstrapping) {
    return <main className="screen auth-screen"><div className="app-loading">Loading session...</div></main>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const clearErrors = () => {
    setGlobalError(null)
    setFieldErrors({})
  }

  const setErrorState = (error: unknown) => {
    if (isApiError(error)) {
      setGlobalError(error.message)
      setFieldErrors(error.fieldErrors)
      return
    }

    setGlobalError('Something went wrong. Please try again.')
    setFieldErrors({})
  }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearErrors()
    setIsSubmitting(true)

    try {
      await login(loginForm)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrorState(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignupSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearErrors()

    if (signupForm.password !== signupForm.re_password) {
      setGlobalError('Passwords do not match.')
      setFieldErrors({ re_password: 'Passwords do not match.' })
      return
    }

    setIsSubmitting(true)

    try {
      await signup(signupForm)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrorState(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="screen auth-screen">
      <section className="panel auth-panel">
        <header>
          <p className="eyebrow">Una Authentication</p>
          <h1 className="title">{heading}</h1>
        </header>

        <div className="switch-row" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`switch-button ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              clearErrors()
              setMode('login')
            }}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`switch-button ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              clearErrors()
              setMode('signup')
            }}
          >
            Sign Up
          </button>
        </div>

        {globalError ? <p className="error-banner">{globalError}</p> : null}

        {mode === 'login' ? (
          <form className="form-grid" onSubmit={handleLoginSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) => setLoginForm((state) => ({ ...state, email: event.target.value }))}
                required
                autoComplete="email"
              />
              {fieldErrors.email ? <small className="field-error">{fieldErrors.email}</small> : null}
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => setLoginForm((state) => ({ ...state, password: event.target.value }))}
                required
                autoComplete="current-password"
              />
              {fieldErrors.password ? <small className="field-error">{fieldErrors.password}</small> : null}
            </label>

            <button type="submit" className="button" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form className="form-grid" onSubmit={handleSignupSubmit}>
            <label className="field">
              <span>First name</span>
              <input
                type="text"
                value={signupForm.first_name}
                onChange={(event) => setSignupForm((state) => ({ ...state, first_name: event.target.value }))}
                required
                autoComplete="given-name"
              />
              {fieldErrors.first_name ? <small className="field-error">{fieldErrors.first_name}</small> : null}
            </label>

            <label className="field">
              <span>Last name</span>
              <input
                type="text"
                value={signupForm.last_name}
                onChange={(event) => setSignupForm((state) => ({ ...state, last_name: event.target.value }))}
                required
                autoComplete="family-name"
              />
              {fieldErrors.last_name ? <small className="field-error">{fieldErrors.last_name}</small> : null}
            </label>

            <label className="field">
              <span>Email</span>
              <input
                type="email"
                value={signupForm.email}
                onChange={(event) => setSignupForm((state) => ({ ...state, email: event.target.value }))}
                required
                autoComplete="email"
              />
              {fieldErrors.email ? <small className="field-error">{fieldErrors.email}</small> : null}
            </label>

            <label className="field">
              <span>Password</span>
              <input
                type="password"
                value={signupForm.password}
                onChange={(event) => setSignupForm((state) => ({ ...state, password: event.target.value }))}
                required
                autoComplete="new-password"
              />
              {fieldErrors.password ? <small className="field-error">{fieldErrors.password}</small> : null}
            </label>

            <label className="field">
              <span>Confirm password</span>
              <input
                type="password"
                value={signupForm.re_password}
                onChange={(event) => setSignupForm((state) => ({ ...state, re_password: event.target.value }))}
                required
                autoComplete="new-password"
              />
              {fieldErrors.re_password ? <small className="field-error">{fieldErrors.re_password}</small> : null}
            </label>

            <button type="submit" className="button" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}
