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

// Projects API functions
export const projectsApi = {
  // Get all projects with filtering
  getAll: async (filters: {
    status?: string
    partnerId?: string
    customerId?: string
    search?: string
    page?: number
    limit?: number
  } = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) params.append(key, value.toString())
    })
    
    const response = await api.get(`/projects?${params}`)
    return response.data
  },

  // Get project by ID
  getById: async (id: string) => {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  // Create new project
  create: async (data: {
    name: string
    description?: string
    projectType: 'new-install' | 'upgrade' | 'service' | 'design-only'
    customerId: string
    propertyId?: string
    primaryPartnerId?: string
    startDate?: string
    projectedFinishDate?: string
    materialDeliveryDate?: string
    estimatedValue?: number
    templateId?: string
  }) => {
    const response = await api.post('/projects', data)
    return response.data
  },

  // Update project
  update: async (id: string, data: {
    name?: string
    description?: string
    status?: 'planning' | 'active' | 'completed' | 'on-hold' | 'cancelled'
    projectType?: 'new-install' | 'upgrade' | 'service' | 'design-only'
    startDate?: string
    endDate?: string
    projectedFinishDate?: string
    materialDeliveryDate?: string
    estimatedValue?: number
    actualCost?: number
    materialsCost?: number
    laborCost?: number
    hardwareCost?: number
    progressPercent?: number
    primaryPartnerId?: string
  }) => {
    const response = await api.put(`/projects/${id}`, data)
    return response.data
  },

  // Delete project
  delete: async (id: string) => {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  },

  // Add partner to project
  addPartner: async (id: string, data: {
    partnerId: string
    role?: string
  }) => {
    const response = await api.post(`/projects/${id}/partners`, data)
    return response.data
  },

  // Remove partner from project
  removePartner: async (id: string, partnerId: string) => {
    const response = await api.delete(`/projects/${id}/partners/${partnerId}`)
    return response.data
  },

  // Add team member to project
  addMember: async (id: string, data: {
    userId: string
    role: 'project-manager' | 'technician' | 'laborer' | 'subcontractor'
    isLaborer?: boolean
  }) => {
    const response = await api.post(`/projects/${id}/members`, data)
    return response.data
  },

  // Get project tasks
  getTasks: async (id: string) => {
    const response = await api.get(`/projects/${id}/tasks`)
    return response.data
  },

  // Create project task
  createTask: async (id: string, data: {
    title: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    dueDate?: string
    assignedTo?: string
  }) => {
    const response = await api.post(`/projects/${id}/tasks`, data)
    return response.data
  },

  // Update task
  updateTask: async (id: string, taskId: string, data: {
    status?: 'pending' | 'in-progress' | 'completed'
    title?: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    dueDate?: string
    assignedTo?: string
  }) => {
    const response = await api.put(`/projects/${id}/tasks/${taskId}`, data)
    return response.data
  },

  // Create change order
  createChangeOrder: async (id: string, data: {
    title: string
    description: string
    reason: 'scope-change' | 'cost-adjustment' | 'timeline-change'
    costChange: number
  }) => {
    const response = await api.post(`/projects/${id}/change-orders`, data)
    return response.data
  },

  // Approve/reject change order
  updateChangeOrder: async (id: string, changeOrderId: string, status: 'approved' | 'rejected') => {
    const response = await api.put(`/projects/${id}/change-orders/${changeOrderId}`, { status })
    return response.data
  },

  // Get project activity
  getActivity: async (id: string, limit: number = 50) => {
    const response = await api.get(`/projects/${id}/activity?limit=${limit}`)
    return response.data
  },

  // Add activity note
  addNote: async (id: string, data: {
    title?: string
    description: string
  }) => {
    const response = await api.post(`/projects/${id}/activity`, data)
    return response.data
  }
}

export default api