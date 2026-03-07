import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  getMe,
  login as loginRequest,
  refreshSession as refreshAccessToken,
  signup as signupRequest,
  type AuthUser,
  type LoginPayload,
  type SignupPayload,
} from '../lib/api'
import { AuthContext, type AuthContextValue } from './auth-context'

const ACCESS_TOKEN_KEY = 'una.accessToken'
const REFRESH_TOKEN_KEY = 'una.refreshToken'

function getStoredToken(key: string): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(key)
}

function setStoredToken(key: string, value: string): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, value)
}

function removeStoredToken(key: string): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(key)
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const clearSession = useCallback(() => {
    removeStoredToken(ACCESS_TOKEN_KEY)
    removeStoredToken(REFRESH_TOKEN_KEY)
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
  }, [])

  const applySession = useCallback((nextAccessToken: string, nextRefreshToken: string, nextUser: AuthUser) => {
    setStoredToken(ACCESS_TOKEN_KEY, nextAccessToken)
    setStoredToken(REFRESH_TOKEN_KEY, nextRefreshToken)

    setAccessToken(nextAccessToken)
    setRefreshToken(nextRefreshToken)
    setUser(nextUser)
  }, [])

  const refreshSession = useCallback(async (): Promise<string | null> => {
    if (!refreshToken) {
      clearSession()
      return null
    }

    try {
      const refreshed = await refreshAccessToken({ refresh: refreshToken })
      const nextAccessToken = refreshed.access
      const nextUser = await getMe(nextAccessToken)

      setStoredToken(ACCESS_TOKEN_KEY, nextAccessToken)
      setAccessToken(nextAccessToken)
      setUser(nextUser)

      return nextAccessToken
    } catch {
      clearSession()
      return null
    }
  }, [clearSession, refreshToken])

  const login = useCallback(
    async (payload: LoginPayload): Promise<AuthUser> => {
      const jwtPair = await loginRequest(payload)

      try {
        const nextUser = await getMe(jwtPair.access)
        applySession(jwtPair.access, jwtPair.refresh, nextUser)
        return nextUser
      } catch (error) {
        clearSession()
        throw error
      }
    },
    [applySession, clearSession],
  )

  const signup = useCallback(
    async (payload: SignupPayload): Promise<AuthUser> => {
      await signupRequest(payload)
      return login({ email: payload.email, password: payload.password })
    },
    [login],
  )

  const logout = useCallback(() => {
    clearSession()
  }, [clearSession])

  useEffect(() => {
    let isMounted = true

    async function bootstrap() {
      const storedAccessToken = getStoredToken(ACCESS_TOKEN_KEY)
      const storedRefreshToken = getStoredToken(REFRESH_TOKEN_KEY)

      if (!storedAccessToken || !storedRefreshToken) {
        if (isMounted) {
          clearSession()
          setIsBootstrapping(false)
        }
        return
      }

      if (isMounted) {
        setAccessToken(storedAccessToken)
        setRefreshToken(storedRefreshToken)
      }

      try {
        const me = await getMe(storedAccessToken)

        if (!isMounted) {
          return
        }

        setUser(me)
      } catch {
        if (!isMounted) {
          return
        }

        try {
          const refreshed = await refreshAccessToken({ refresh: storedRefreshToken })
          const me = await getMe(refreshed.access)

          if (!isMounted) {
            return
          }

          setStoredToken(ACCESS_TOKEN_KEY, refreshed.access)
          setAccessToken(refreshed.access)
          setUser(me)
        } catch {
          if (!isMounted) {
            return
          }

          clearSession()
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false)
        }
      }
    }

    void bootstrap()

    return () => {
      isMounted = false
    }
  }, [clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: Boolean(accessToken && user),
      isBootstrapping,
      login,
      signup,
      logout,
      refreshSession,
    }),
    [accessToken, isBootstrapping, login, logout, refreshSession, refreshToken, signup, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
