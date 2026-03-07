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

function isLikelyEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test(value)
}

function validateLoginForm(values: LoginFormState): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!isLikelyEmail(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  }

  return errors
}

function validateSignupForm(values: SignupFormState): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!values.first_name.trim()) {
    errors.first_name = 'First name is required.'
  }

  if (!values.last_name.trim()) {
    errors.last_name = 'Last name is required.'
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!isLikelyEmail(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.password) {
    errors.password = 'Password is required.'
  }

  if (!values.re_password) {
    errors.re_password = 'Please confirm your password.'
  }

  if (values.password && values.re_password && values.password !== values.re_password) {
    errors.re_password = 'Passwords do not match.'
  }

  return errors
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

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearErrors()

    const errors = validateLoginForm(loginForm)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setGlobalError('Please correct the highlighted fields.')
      return
    }

    setIsSubmitting(true)

    try {
      await login({
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password,
      })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrorState(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignupSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    clearErrors()

    const errors = validateSignupForm(signupForm)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setGlobalError('Please correct the highlighted fields.')
      return
    }

    setIsSubmitting(true)

    try {
      await signup({
        email: signupForm.email.trim().toLowerCase(),
        password: signupForm.password,
        re_password: signupForm.re_password,
        first_name: signupForm.first_name.trim(),
        last_name: signupForm.last_name.trim(),
      })
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
