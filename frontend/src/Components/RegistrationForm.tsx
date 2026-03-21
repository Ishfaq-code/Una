import type React from 'react'
import type { RegistrationUser } from '../lib/types'

type RegistrationFormProps = {
  values: RegistrationUser
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (event: React.SubmitEvent<HTMLFormElement>) => void
  isSubmitting: boolean
}

const RegistrationForm = ({ values, onChange, onSubmit, isSubmitting }: RegistrationFormProps) => {
  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="register-first-name">First name</label>
        <input
          id="register-first-name"
          name="first_name"
          type="text"
          autoComplete="given-name"
          value={values.first_name}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <label htmlFor="register-last-name">Last name</label>
        <input
          id="register-last-name"
          name="last_name"
          type="text"
          autoComplete="family-name"
          value={values.last_name}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={onChange}
          required
        />
      </div>

      <div>
        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={onChange}
          required
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Register'}
      </button>
    </form>
  )
}

export default RegistrationForm
