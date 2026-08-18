const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type Role = 'customer' | 'owner'

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

export type Transmission = 'manual' | 'automatic'
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg'
export type InsuranceType = 'basic' | 'full'
export type CarStatus = 'available' | 'rented' | 'maintenance'

export interface CarImage {
  id: number
  car_id: number
  image_path: string
  is_primary: boolean
  created_at: string
}

export interface CarOwner {
  id: number
  first_name: string
  last_name: string
  phone_number: string
  email: string
}

export interface Car {
  id: number
  owner_id: number
  owner: CarOwner
  brand: string
  model: string
  year: number
  transmission: Transmission
  fuel_type: FuelType
  fuel_consumption: number | null
  seats: number
  color: string | null
  city: string | null
  license_plate: string
  daily_price: number
  insurance_type: InsuranceType
  has_highway_vignette: boolean
  has_air_conditioning: boolean
  status: CarStatus
  created_at: string
  updated_at: string
  images: CarImage[]
}

export interface CarPayload {
  brand: string
  model: string
  year: number
  transmission: Transmission
  fuel_type: FuelType
  fuel_consumption: number | null
  seats: number
  color: string | null
  city: string | null
  license_plate: string
  daily_price: number
  insurance_type: InsuranceType
  has_highway_vignette: boolean
  has_air_conditioning: boolean
  status: CarStatus
}

export type RentalStatus = 'reserved' | 'ongoing' | 'completed' | 'cancelled'

export interface Rental {
  id: number
  car: Car
  start_date: string
  end_date: string
  total_price: number
  status: RentalStatus
  created_at: string
}

export class ApiError extends Error {}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

async function parseErrorMessage(response: Response): Promise<string> {
  const body = await response.json().catch(() => null)
  const message = body?.detail ?? `Hiba történt (${response.status})`
  return typeof message === 'string' ? message : 'Hiba történt'
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response))
  }

  if (response.status === 204) {
    return undefined as T
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
    headers: authHeaders(token),
  })
}

export function listCars() {
  return request<Car[]>('/cars')
}

export function listMyCars(token: string) {
  return request<Car[]>('/cars/mine', {
    headers: authHeaders(token),
  })
}

export function getCar(carId: number) {
  return request<Car>(`/cars/${carId}`)
}

export function createCar(token: string, payload: CarPayload) {
  return request<Car>('/cars', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function updateCar(token: string, carId: number, payload: CarPayload) {
  return request<Car>(`/cars/${carId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function deleteCar(token: string, carId: number) {
  return request<void>(`/cars/${carId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export async function uploadCarImage(
  token: string,
  carId: number,
  file: File,
  isPrimary: boolean,
): Promise<CarImage> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('is_primary', String(isPrimary))

  const response = await fetch(`${API_BASE_URL}/cars/${carId}/images/upload`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  })

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response))
  }

  return response.json() as Promise<CarImage>
}

export function updateCarImage(
  token: string,
  carId: number,
  imageId: number,
  payload: { is_primary: boolean },
) {
  return request<CarImage>(`/cars/${carId}/images/${imageId}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function deleteCarImage(token: string, carId: number, imageId: number) {
  return request<void>(`/cars/${carId}/images/${imageId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export function listRentals(token: string) {
  return request<Rental[]>('/rentals', {
    headers: authHeaders(token),
  })
}

export function deleteRental(token: string, rentalId: number) {
  return request<void>(`/rentals/${rentalId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
}

export interface RentalCreatePayload {
  car_id: number
  start_date: string
  end_date: string
}

export function createRental(token: string, payload: RentalCreatePayload) {
  return request<Rental>('/rentals', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export function imageUrl(path: string) {
  return `${API_BASE_URL}${path}`
}
