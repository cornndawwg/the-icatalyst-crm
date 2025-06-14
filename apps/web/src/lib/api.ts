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

// Partner Discovery API functions (ready for Google Places + Hunter.io integration)
export const discoveryApi = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  searchPartners: async (params: {
    location: string
    radius: number
    types: string[]
  }) => {
    // TODO: Implement Google Places API search
    // const response = await api.post('/discovery/search', params)
    // return response.data
    throw new Error('Discovery API not yet implemented')
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  enrichPartnerContact: async (businessName: string, website?: string) => {
    // TODO: Implement Hunter.io contact discovery
    // const response = await api.post('/discovery/enrich-contact', { businessName, website })
    // return response.data
    throw new Error('Contact enrichment API not yet implemented')
  },

  addDiscoveredPartner: async (discoveredPartner: {
    name: string
    type: 'interior-designer' | 'builder' | 'architect'
    address: string
    phone?: string
    website?: string
    email?: string
    specialties?: string[]
    rating?: number
    reviewCount?: number
  }) => {
    // Convert discovered partner to CRM partner format
    const partnerData = {
      companyName: discoveredPartner.name,
      type: discoveredPartner.type,
      contactName: 'Contact', // TODO: Get from contact discovery
      email: discoveredPartner.email || '',
      phone: discoveredPartner.phone,
      website: discoveredPartner.website,
      specialties: discoveredPartner.specialties || [],
      notes: `Added from partner discovery. Rating: ${discoveredPartner.rating}/5 (${discoveredPartner.reviewCount} reviews)\nAddress: ${discoveredPartner.address}`
    }
    
    const response = await api.post('/partners', partnerData)
    return response.data
  }
}

export default api