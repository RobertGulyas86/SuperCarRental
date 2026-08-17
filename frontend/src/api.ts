const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type Role = 'customer' | 'employee'

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number: string
  role: Role
  created_at: string
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  password: string
  role: Role
}

export interface LoginPayload {
  email: string
  password: string
}

export class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = body?.detail ?? `Hiba történt (${response.status})`
    throw new ApiError(typeof message === 'string' ? message : 'Hiba történt')
  }

  return response.json() as Promise<T>
}

export function register(payload: RegisterPayload) {
  return request<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload: LoginPayload) {
  return request<{ access_token: string; token_type: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchCurrentUser(token: string) {
  return request<User>('/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  })
}
