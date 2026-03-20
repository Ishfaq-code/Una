import { API_BASE_URL } from '../config/env'

const ENDPOINTS = {
  USER_ME: '/api/users/me/',
  USER_REGISTER: '/api/users/register/',
  USER_LOGIN: '/api/users/login/',
  USER_LOGOUT: '/api/users/logout/',
  USER_REFRESH: '/api/users/refresh/',
}

export const register = async (email: string, password: string, first_name: string, last_name: string) => {
  const URL = `${API_BASE_URL}${ENDPOINTS.USER_LOGIN}`
  return fetch(URL, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({email: email, password: password, first_name: first_name, last_name: last_name})
  })
} 

export const login = async (email:string, password:string) => {
  const URL = `${API_BASE_URL}${ENDPOINTS.USER_LOGIN}`
  return fetch(URL, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({email: email, password: password})
  })
}

export const logout = async () => {
  const URL = `${API_BASE_URL}${ENDPOINTS.USER_LOGOUT}`
  return fetch(URL, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({})
  })
}

export const refreshToken = async () => {
  const URL = `${API_BASE_URL}${ENDPOINTS.USER_REFRESH}`
  return fetch(URL, {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({})
  })
}