import type React from 'react'
import type { LoginUser } from '../lib/types'

type LoginFormProps = {
  values: LoginUser
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isSubmitting: boolean
}

const LoginForm = ({ values, onChange, onSubmit, isSubmitting }: LoginFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={onChange}
          required
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}

export default LoginForm
