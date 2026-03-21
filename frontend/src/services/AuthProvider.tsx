import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { login, logout, me, refreshToken, register } from '../lib/api'
import type { User } from '../lib/types'

type AuthResult = {
  success: boolean
  error?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAuthLoading: boolean
  loginUser: (email: string, password: string) => Promise<AuthResult>
  registerUser: (email: string, password: string, firstName: string, lastName: string) => Promise<AuthResult>
  logoutUser: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const fallbackErrorMessage = 'Request failed. Please try again.'

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = await response.json() as { error?: unknown; message?: unknown; detail?: unknown }
    const message = payload.error ?? payload.message ?? payload.detail

    if (typeof message === 'string' && message.trim() !== '') {
      return message
    }
  } catch {
    return fallbackErrorMessage
  }

  return fallbackErrorMessage
}

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true)

  const setLoggedOut = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  const setLoggedIn = (nextUser: User) => {
    setUser(nextUser)
    setIsAuthenticated(true)
  }

  const checkAuth = async () => {
    setIsAuthLoading(true)

    try {
      const meResponse = await me()

      if (meResponse.ok) {
        const mePayload = await meResponse.json() as User
        setLoggedIn(mePayload)
        return
      }

      if (meResponse.status !== 401) {
        setLoggedOut()
        return
      }

      const refreshResponse = await refreshToken()
      if (!refreshResponse.ok) {
        setLoggedOut()
        return
      }

      const retryMeResponse = await me()
      if (!retryMeResponse.ok) {
        setLoggedOut()
        return
      }

      const mePayload = await retryMeResponse.json() as User
      setLoggedIn(mePayload)
    } catch {
      setLoggedOut()
    } finally {
      setIsAuthLoading(false)
    }
  }

  const loginUser = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const response = await login(email, password)
      if (!response.ok) {
        return { success: false, error: await parseErrorMessage(response) }
      }

      const payload = await response.json() as { user?: User }
      if (payload.user) {
        setLoggedIn(payload.user)
      } else {
        await checkAuth()
      }

      return { success: true }
    } catch {
      return { success: false, error: 'Unable to login right now. Please try again.' }
    }
  }

  const registerUser = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<AuthResult> => {
    try {
      const response = await register(email, password, firstName, lastName)
      if (!response.ok) {
        return { success: false, error: await parseErrorMessage(response) }
      }

      return { success: true }
    } catch {
      return { success: false, error: 'Unable to register right now. Please try again.' }
    }
  }

  const logoutUser = async () => {
    try {
      await logout()
    } finally {
      setLoggedOut()
    }
  }

  useEffect(() => {
    void checkAuth()
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAuthLoading,
      loginUser,
      registerUser,
      logoutUser,
      checkAuth,
    }),
    [user, isAuthenticated, isAuthLoading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

export default AuthProvider
