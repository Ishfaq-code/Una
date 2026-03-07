export interface JwtPair {
  access: string
  refresh: string
}

export interface AuthUser {
  id: number
  email: string
  first_name?: string
  last_name?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  email: string
  password: string
  re_password: string
  first_name: string
  last_name: string
}

export interface RefreshPayload {
  refresh: string
}

export interface ApiError {
  status: number
  message: string
  fieldErrors: Record<string, string>
  raw: unknown
}

const DEFAULT_API_BASE_URL = 'http://localhost:8000'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '')

const friendlyMessageByStatus: Record<number, string> = {
  400: 'Please check the provided information.',
  401: 'Email or password is incorrect.',
  403: 'You do not have permission to perform this action.',
  404: 'Requested resource was not found.',
  500: 'Server error. Please try again later.',
}

function flattenFieldErrors(payload: unknown): Record<string, string> {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {}
  }

  return Object.entries(payload as Record<string, unknown>).reduce<Record<string, string>>(
    (accumulator, [key, value]) => {
      if (Array.isArray(value)) {
        accumulator[key] = value.map((item) => String(item)).join(' ')
        return accumulator
      }

      if (typeof value === 'string') {
        accumulator[key] = value
      }

      return accumulator
    },
    {},
  )
}

function deriveMessage(status: number, payload: unknown): string {
  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const detail = (payload as { detail?: unknown }).detail
    if (typeof detail === 'string' && detail.trim().length > 0) {
      if (detail.toLowerCase().includes('no active account')) {
        return 'No account exists with those credentials.'
      }

      return detail
    }

    const nonFieldErrors = (payload as { non_field_errors?: unknown }).non_field_errors
    if (Array.isArray(nonFieldErrors) && nonFieldErrors.length > 0) {
      return nonFieldErrors.map((item) => String(item)).join(' ')
    }
  }

  return friendlyMessageByStatus[status] ?? 'Request failed. Please try again.'
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

async function request<TResponse, TBody = unknown>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: TBody
    token?: string
  } = {},
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const payload = await parseResponseBody(response)
  if (!response.ok) {
    const apiError: ApiError = {
      status: response.status,
      message: deriveMessage(response.status, payload),
      fieldErrors: flattenFieldErrors(payload),
      raw: payload,
    }
    throw apiError
  }

  return payload as TResponse
}

export function login(payload: LoginPayload): Promise<JwtPair> {
  return request<JwtPair, LoginPayload>('/auth/jwt/create/', {
    method: 'POST',
    body: payload,
  })
}

export function signup(payload: SignupPayload): Promise<AuthUser> {
  return request<AuthUser, SignupPayload>('/auth/users/', {
    method: 'POST',
    body: payload,
  })
}

export function refreshSession(payload: RefreshPayload): Promise<{ access: string }> {
  return request<{ access: string }, RefreshPayload>('/auth/jwt/refresh/', {
    method: 'POST',
    body: payload,
  })
}

export function getMe(token: string): Promise<AuthUser> {
  return request<AuthUser>('/auth/users/me/', {
    method: 'GET',
    token,
  })
}
