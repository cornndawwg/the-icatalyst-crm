export interface Partner {
  id: string
  type: 'interior-designer' | 'builder' | 'architect'
  companyName: string
  contactName: string
  email: string
  phone?: string
  website?: string
  specialties?: string[]
  notes?: string
  relationshipScore: number
  interactions?: Interaction[]
  leads?: Lead[]
  createdAt: string
  updatedAt: string
}

export interface Interaction {
  id: string
  type: string
  subject: string
  description?: string
  outcome: 'positive' | 'negative' | 'neutral'
  date: string
}

export interface Lead {
  id: string
  status: string
  createdAt: string
  customer?: {
    name: string
    email: string
  }
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

export interface Organization {
  id: string
  name: string
  plan: string
}

export interface DiscoveredPartner {
  id: string
  name: string
  type: 'interior-designer' | 'builder' | 'architect'
  address: string
  phone?: string
  website?: string
  email?: string
  rating: number
  reviewCount: number
  specialties: string[]
  distance: string
}