/**
 * Configuration de base pour la communication entre Marchi Front (React/Vite)
 * et le backend Spring Boot (xsupply).
 */

export const BACKEND_URL = (import.meta.env?.VITE_BACKEND_URL || 'http://localhost:8088').replace(/\/+$/, '')
export const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || `${BACKEND_URL}/api/v1`).replace(/\/+$/, '')
export const UPLOADS_BASE_URL = `${API_BASE_URL}/uploads`

export const API_PATHS = {
  auth: {
    register: `${API_BASE_URL}/auth/register`,
    authenticate: `${API_BASE_URL}/auth/authenticate`,
    refreshToken: `${API_BASE_URL}/auth/refresh-token`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
  },
  user: {
    base: `${API_BASE_URL}/user`,
    byEmail: email => `${API_BASE_URL}/user/${encodeURIComponent(email)}`,
    byId: id => `${API_BASE_URL}/user/loadById/${id}`,
    loadByUsername: email => `${API_BASE_URL}/user/loadUserByUsername?email=${encodeURIComponent(email)}`,
    uploadProfilePicture: `${API_BASE_URL}/user/upload-profile-picture`,
    profilePicture: fileName => `${API_BASE_URL}/user/profilePicture/${encodeURIComponent(fileName)}`,
  },
}

export const AUTH_STORAGE_KEYS = {
  token: 'marchy-auth-token',
  refreshToken: 'marchy-refresh-token',
}

export function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_STORAGE_KEYS.token) || ''
  } catch {
    return ''
  }
}

export async function apiClient(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`

  const token = getAuthToken()
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  const headers = {
    Accept: 'application/json',
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 204 || response.status === 202) {
    return null
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw data || new Error(`HTTP Error ${response.status}`)
  }

  return data
}

