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

export interface FuturePartner {
  id: string
  name: string
  type: 'interior-designer' | 'builder' | 'architect'
  address: string
  phone?: string
  website?: string
  email?: string
  rating?: number
  reviewCount?: number
  specialties: string[]
  discoveredDate: string
  status: 'new' | 'contacted' | 'interested' | 'not-interested' | 'converted'
  notes?: string
  campaignHistory: EmailCampaignInteraction[]
  source: 'discovery' | 'referral' | 'manual'
}

export interface EmailCampaign {
  id: string
  name: string
  subject: string
  content: string
  targetTypes: ('interior-designer' | 'builder' | 'architect')[]
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'completed'
  scheduledDate?: string
  sentDate?: string
  createdAt: string
  analytics: EmailCampaignAnalytics
  recipients: string[] // Future partner IDs
}

export interface EmailCampaignInteraction {
  id: string
  campaignId: string
  campaignName: string
  sentDate: string
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced'
  openDate?: string
  clickDate?: string
  replyDate?: string
}

export interface EmailCampaignAnalytics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  replied: number
  bounced: number
  unsubscribed: number
  conversionRate: number
  openRate: number
  clickRate: number
}