const productionApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (import.meta.env.PROD && !productionApiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is required for production builds.')
}

export const API_BASE_URL = import.meta.env.DEV ? '' : (productionApiBaseUrl ?? '')
