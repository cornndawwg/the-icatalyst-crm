import axios from 'axios'
import type { Partner } from '@/types'

// API client configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://the-icatalyst-crm-icatalyst.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API functions
export const authApi = {
  register: async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    companyName: string
  }) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// Partners API functions
export const partnersApi = {
  getAll: async (): Promise<Partner[]> => {
    const response = await api.get('/partners')
    return response.data
  },

  create: async (data: {
    type: 'interior-designer' | 'builder' | 'architect'
    companyName: string
    contactName: string
    email: string
    phone?: string
    website?: string
    specialties?: string[]
    notes?: string
  }) => {
    const response = await api.post('/partners', data)
    return response.data
  },

  getById: async (id: string): Promise<Partner> => {
    const response = await api.get(`/partners/${id}`)
    return response.data
  },

  update: async (id: string, data: Partial<{
    type: 'interior-designer' | 'builder' | 'architect'
    companyName: string
    contactName: string
    email: string
    phone?: string
    website?: string
    specialties?: string[]
    notes?: string
  }>) => {
    const response = await api.put(`/partners/${id}`, data)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/partners/${id}`)
    return response.data
  },

  addInteraction: async (id: string, data: {
    type: string
    subject: string
    description?: string
    outcome?: string
  }) => {
    const response = await api.post(`/partners/${id}/interactions`, data)
    return response.data
  },
}

export default api