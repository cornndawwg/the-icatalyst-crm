'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { 
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Globe,
  Star,
  Calendar,
  MessageSquare,
  UserPlus,
  Building2,
  Edit,
  Save,
  X,
  Send,
  Eye,
  MousePointer,
  Reply,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import type { FuturePartner } from '@/types'

export default function FuturePartnerDetailPage() {
  const [partner, setPartner] = useState<FuturePartner | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<FuturePartner>>({})
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const params = useParams()
  const partnerId = params.id as string

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        // TODO: Replace with actual API call
        // const partnerData = await futurePartnersApi.getById(partnerId)
        
        // Mock data for now
        const mockPartner: FuturePartner = {
          id: partnerId,
          name: 'Luxe Interior Design',
          type: 'interior-designer',
          address: '456 Design Ave, City, ST 12345',
          phone: '(555) 987-6543',
          website: 'https://luxeinteriors.com',
          email: 'info@luxeinteriors.com',
          rating: 4.9,
          reviewCount: 203,
          specialties: ['Luxury Homes', 'Modern Design', 'Smart Home Integration'],
          discoveredDate: '2024-01-10',
          status: 'contacted',
          notes: 'Expressed interest in smart home partnerships during initial outreach. Specializes in high-end residential projects.',
          source: 'discovery',
          campaignHistory: [
            {
              id: 'ci-1',
              campaignId: 'camp-1',
              campaignName: 'Smart Home Partnership Intro',
              sentDate: '2024-01-11',
              status: 'opened',
              openDate: '2024-01-11'
            },
            {
              id: 'ci-2',
              campaignId: 'camp-2',
              campaignName: 'Follow-up: Partnership Benefits',
              sentDate: '2024-01-15',
              status: 'clicked',
              openDate: '2024-01-15',
              clickDate: '2024-01-15'
            }
          ]
        }
        
        setPartner(mockPartner)
        setEditForm(mockPartner)
      } catch (error) {
        console.error('Error fetching partner:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (partnerId) {
      fetchPartner()
    }
  }, [partnerId])

  const handleSave = async () => {
    if (!partner || !editForm) return
    
    setIsSaving(true)
    try {
      // TODO: Replace with actual API call
      // await futurePartnersApi.update(partner.id, editForm)
      
      setPartner({ ...partner, ...editForm })
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating partner:', error)
      alert('Error updating partner. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: FuturePartner['status']) => {
    if (!partner) return
    
    try {
      // TODO: Replace with actual API call
      // await futurePartnersApi.updateStatus(partner.id, newStatus)
      
      setPartner({ ...partner, status: newStatus })
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status. Please try again.')
    }
  }

  const handleConvertToPartner = async () => {
    if (!partner) return
    
    if (confirm(`Convert ${partner.name} to an active partner? This will move them to your main partners list.`)) {
      try {
        // TODO: Replace with actual API call
        // await futurePartnersApi.convertToPartner(partner.id)
        
        alert(`${partner.name} has been converted to an active partner!`)
        router.push('/partners')
      } catch (error) {
        console.error('Error converting partner:', error)
        alert('Error converting partner. Please try again.')
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'contacted':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'interested':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'not-interested':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'converted':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPartnerTypeColor = (type: string) => {
    switch (type) {
      case 'interior-designer':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'builder':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'architect':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatPartnerType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getInteractionIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Send className="h-4 w-4 text-blue-600" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'opened':
        return <Eye className="h-4 w-4 text-purple-600" />
      case 'clicked':
        return <MousePointer className="h-4 w-4 text-orange-600" />
      case 'replied':
        return <Reply className="h-4 w-4 text-emerald-600" />
      case 'bounced':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading partner details...</p>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Partner not found</h3>
          <p className="text-gray-600 mb-4">The partner you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Button onClick={() => router.push('/future-partners')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Future Partners
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/future-partners')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Future Partner Details
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  {partner.status !== 'converted' && (
                    <Button onClick={handleConvertToPartner}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Convert to Partner
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Partner Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Partner Information</CardTitle>
                    <CardDescription>Basic details and contact information</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPartnerTypeColor(partner.type)}>
                      {formatPartnerType(partner.type)}
                    </Badge>
                    <Select 
                      value={partner.status} 
                      onValueChange={(value) => handleStatusChange(value as FuturePartner['status'])}
                    >
                      <SelectTrigger className="w-40">
                        <Badge className={getStatusColor(partner.status)}>
                          {partner.status.replace('-', ' ')}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="interested">Interested</SelectItem>
                        <SelectItem value="not-interested">Not Interested</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Company Name</label>
                      <Input
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Website</label>
                      <Input
                        value={editForm.website || ''}
                        onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Address</label>
                      <Input
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{partner.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{partner.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium">{partner.address}</p>
                      </div>
                    </div>
                    {partner.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Website</p>
                          <a 
                            href={partner.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Rating and Specialties */}
                {!isEditing && (
                  <>
                    {partner.rating && (
                      <div className="flex items-center gap-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                          <span className="font-medium">{partner.rating}</span>
                          <span className="text-sm text-gray-600">({partner.reviewCount} reviews)</span>
                        </div>
                      </div>
                    )}

                    {partner.specialties && partner.specialties.length > 0 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-2">Specialties</p>
                        <div className="flex flex-wrap gap-2">
                          {partner.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
                <CardDescription>Internal notes and observations</CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    placeholder="Add notes about this partner..."
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {partner.notes || 'No notes added yet.'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Status & Activity */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Partner Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Discovered</p>
                    <p className="font-medium">{new Date(partner.discoveredDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Source</p>
                    <p className="font-medium capitalize">{partner.source}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Campaigns Sent</p>
                    <p className="font-medium">{partner.campaignHistory.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign History */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign History</CardTitle>
                <CardDescription>Email campaign interactions</CardDescription>
              </CardHeader>
              <CardContent>
                {partner.campaignHistory.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No campaigns sent yet</p>
                ) : (
                  <div className="space-y-4">
                    {partner.campaignHistory.map((interaction) => (
                      <div key={interaction.id} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-sm">{interaction.campaignName}</h4>
                            <p className="text-xs text-gray-600">
                              {new Date(interaction.sentDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {getInteractionIcon(interaction.status)}
                            <span className="text-xs capitalize">{interaction.status}</span>
                          </div>
                        </div>
                        
                        {/* Interaction Timeline */}
                        <div className="space-y-1 text-xs text-gray-600">
                          <div>Sent: {new Date(interaction.sentDate).toLocaleString()}</div>
                          {interaction.openDate && (
                            <div>Opened: {new Date(interaction.openDate).toLocaleString()}</div>
                          )}
                          {interaction.clickDate && (
                            <div>Clicked: {new Date(interaction.clickDate).toLocaleString()}</div>
                          )}
                          {interaction.replyDate && (
                            <div>Replied: {new Date(interaction.replyDate).toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add to Campaign
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Direct Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="mr-2 h-4 w-4" />
                  Schedule Call
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}