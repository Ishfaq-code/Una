import { createContext } from 'react'

import type { AuthUser, LoginPayload, SignupPayload } from '../lib/api'

export interface AuthContextValue {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  signup: (payload: SignupPayload) => Promise<AuthUser>
  logout: () => void
  refreshSession: () => Promise<string | null>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
