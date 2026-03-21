import React, { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import LoginForm from '../Components/LoginForm'
import RegistrationForm from '../Components/RegistrationForm'
import { useAuth } from '../services/AuthProvider'
import type { LoginUser, RegistrationUser } from '../lib/types'

const AuthenticationPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isAuthLoading, loginUser, registerUser } = useAuth()

  const [isLogin, setIsLogin] = useState<boolean>(true)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  const [loginDetails, setLoginDetails] = useState<LoginUser>({
    email: '',
    password: '',
  })

  const [registrationDetails, setRegistrationDetails] = useState<RegistrationUser>({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  })

  const switchToLogin = () => {
    setIsLogin(true)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const switchToRegister = () => {
    setIsLogin(false)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleLoginChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    if (name === 'email' || name === 'password') {
      setLoginDetails((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleRegistrationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    if (name === 'email' || name === 'password' || name === 'first_name' || name === 'last_name') {
      setRegistrationDetails((prev) => ({ ...prev, [name]: value }))
    }
  }

  const hasWhitespace = (value: string): boolean => /\s/.test(value)

  const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const validateLogin = (): string | null => {
    if (loginDetails.email.trim() === '' || loginDetails.password.trim() === '') {
      return 'Please fill in email and password.'
    }

    if (hasWhitespace(loginDetails.email) || hasWhitespace(loginDetails.password)) {
      return 'Email and password cannot contain whitespace.'
    }

    return null
  }

  const validateRegistration = (): string | null => {
    if (
      registrationDetails.email.trim() === ''
      || registrationDetails.password.trim() === ''
      || registrationDetails.first_name.trim() === ''
      || registrationDetails.last_name.trim() === ''
    ) {
      return 'Please complete all registration fields.'
    }

    if (hasWhitespace(registrationDetails.email) || hasWhitespace(registrationDetails.password)) {
      return 'Email and password cannot contain whitespace.'
    }

    if (!isValidEmail(registrationDetails.email)) {
      return 'Please enter a valid email address.'
    }

    if (registrationDetails.password.length < 8) {
      return 'Password must be at least 8 characters.'
    }

    return null
  }

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const validationError = validateLogin()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsSubmitting(true)
    const result = await loginUser(loginDetails.email, loginDetails.password)
    setIsSubmitting(false)

    if (!result.success) {
      setErrorMessage(result.error ?? 'Unable to login right now. Please try again.')
      return
    }

    setLoginDetails({ email: '', password: '' })
    navigate('/dashboard', { replace: true })
  }

  const handleRegistrationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const validationError = validateRegistration()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setIsSubmitting(true)
    const result = await registerUser(
      registrationDetails.email,
      registrationDetails.password,
      registrationDetails.first_name,
      registrationDetails.last_name,
    )
    setIsSubmitting(false)

    if (!result.success) {
      setErrorMessage(result.error ?? 'Unable to register right now. Please try again.')
      return
    }

    setSuccessMessage('Account created successfully. Please login.')
    setRegistrationDetails({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
    })
    setIsLogin(true)
  }

  if (isAuthLoading) {
    return <p>Loading...</p>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div>
      <div>
        <button type="button" onClick={switchToLogin} disabled={isLogin}>Login</button>
        <button type="button" onClick={switchToRegister} disabled={!isLogin}>Register</button>
      </div>

      {errorMessage !== '' && <p>{errorMessage}</p>}
      {successMessage !== '' && <p>{successMessage}</p>}

      {isLogin ? (
        <LoginForm
          values={loginDetails}
          onChange={handleLoginChange}
          onSubmit={handleLoginSubmit}
          isSubmitting={isSubmitting}
        />
      ) : (
        <RegistrationForm
          values={registrationDetails}
          onChange={handleRegistrationChange}
          onSubmit={handleRegistrationSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

export default AuthenticationPage
