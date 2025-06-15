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
  // Only access localStorage on client side
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
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

// Future Partners API functions
export const futurePartnersApi = {
  getAll: async () => {
    const response = await api.get('/future-partners')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/future-partners/${id}`)
    return response.data
  },

  create: async (data: {
    name: string
    type: 'interior-designer' | 'builder' | 'architect'
    address: string
    phone?: string
    website?: string
    email?: string
    rating?: number
    reviewCount?: number
    specialties?: string[]
    source: 'discovery' | 'referral' | 'manual'
    notes?: string
  }) => {
    const response = await api.post('/future-partners', data)
    return response.data
  },

  updateStatus: async (id: string, status: 'new' | 'contacted' | 'interested' | 'not-interested' | 'converted') => {
    const response = await api.patch(`/future-partners/${id}/status`, { status })
    return response.data
  },

  convertToPartner: async (id: string) => {
    const response = await api.post(`/future-partners/${id}/convert`)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/future-partners/${id}`)
    return response.data
  }
}

// Email Campaigns API functions
export const emailCampaignsApi = {
  getAll: async () => {
    const response = await api.get('/email/campaigns')
    return response.data
  },

  getById: async (id: string) => {
    const response = await api.get(`/email/campaigns/${id}`)
    return response.data
  },

  create: async (data: {
    name: string
    subject: string
    content: string
    type?: string
    targetAudience: string
    status?: string
    scheduledFor?: string
  }) => {
    const response = await api.post('/email/campaigns', data)
    return response.data
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const response = await api.put(`/email/campaigns/${id}`, data)
    return response.data
  },

  send: async (id: string, recipients: string[]) => {
    const response = await api.post(`/email/campaigns/${id}/send`, { recipients })
    return response.data
  }
}

// Partner Discovery API functions (ready for Google Places + Hunter.io integration)
export const discoveryApi = {

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
    // Convert discovered partner to Future Partner format
    const futurePartnerData = {
      name: discoveredPartner.name,
      type: discoveredPartner.type,
      address: discoveredPartner.address,
      phone: discoveredPartner.phone,
      website: discoveredPartner.website,
      email: discoveredPartner.email,
      rating: discoveredPartner.rating,
      reviewCount: discoveredPartner.reviewCount,
      specialties: discoveredPartner.specialties || [],
      source: 'discovery' as const,
      notes: discoveredPartner.rating ? `Rating: ${discoveredPartner.rating}/5 (${discoveredPartner.reviewCount} reviews)` : undefined
    }
    
    const response = await api.post('/future-partners', futurePartnerData)
    return response.data
  }
}

// Settings API functions
export const settingsApi = {
  // Organization settings
  getOrganization: async () => {
    const response = await api.get('/settings/organization')
    return response.data
  },

  updateOrganization: async (data: {
    name?: string
    email?: string
    phone?: string
    website?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    logo?: string
    emailProvider?: string
    smtpHost?: string
    smtpPort?: string
    smtpUsername?: string
    smtpPassword?: string
    smtpEncryption?: string
    fromEmail?: string
    fromName?: string
    settings?: Record<string, unknown>
  }) => {
    const response = await api.put('/settings/organization', data)
    return response.data
  },

  // User settings
  getUser: async () => {
    const response = await api.get('/settings/user')
    return response.data
  },

  updateUser: async (data: {
    firstName?: string
    lastName?: string
    twoFactorEnabled?: boolean
    emailNotifications?: boolean
    smsNotifications?: boolean
    browserNotifications?: boolean
    weeklyReports?: boolean
    partnerUpdates?: boolean
    campaignResults?: boolean
    calendarSyncEnabled?: boolean
    defaultReminderMinutes?: number
  }) => {
    const response = await api.put('/settings/user', data)
    return response.data
  },

  // Email testing
  testEmail: async (testEmail?: string) => {
    const response = await api.post('/settings/test-email', { testEmail })
    return response.data
  },

  // Calendar integration
  connectGoogleCalendar: async () => {
    const response = await api.post('/settings/calendar/google/connect')
    return response.data
  },

  connectOutlookCalendar: async () => {
    const response = await api.post('/settings/calendar/outlook/connect')
    return response.data
  },

  disconnectCalendar: async (provider: 'google' | 'outlook') => {
    const response = await api.delete(`/settings/calendar/${provider}/disconnect`)
    return response.data
  },

  // Billing
  getBilling: async () => {
    const response = await api.get('/settings/billing')
    return response.data
  },

  // Data export
  exportData: async (dataType: 'partners' | 'campaigns' | 'projects' | 'full') => {
    const response = await api.post(`/settings/export/${dataType}`)
    return response.data
  }
}

export default api