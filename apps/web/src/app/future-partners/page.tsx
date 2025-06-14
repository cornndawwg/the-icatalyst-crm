'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Search,
  Phone,
  Mail,
  ArrowLeft,
  TrendingUp,
  MapPin,
  Calendar,
  UserPlus,
  MessageSquare,
  BarChart3,
  Send,
  Eye,
  MousePointer,
  Reply
} from 'lucide-react'
import type { FuturePartner, EmailCampaign } from '@/types'

export default function FuturePartnersPage() {
  const [futurePartners, setFuturePartners] = useState<FuturePartner[]>([])
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('prospects')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace with actual API calls
        // const futurePartnersData = await futurePartnersApi.getAll()
        // const campaignsData = await emailCampaignsApi.getAll()
        
        // Mock data for now
        const mockFuturePartners: FuturePartner[] = [
          {
            id: 'fp-1',
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
            notes: 'Expressed interest in smart home partnerships',
            source: 'discovery',
            campaignHistory: [
              {
                id: 'ci-1',
                campaignId: 'camp-1',
                campaignName: 'Smart Home Partnership Intro',
                sentDate: '2024-01-11',
                status: 'opened',
                openDate: '2024-01-11'
              }
            ]
          },
          {
            id: 'fp-2',
            name: 'Premier Custom Builders',
            type: 'builder',
            address: '789 Construction Blvd, City, ST 12345',
            phone: '(555) 456-7890',
            website: 'https://premiercustombuilders.com',
            specialties: ['Custom Homes', 'High-End Construction'],
            discoveredDate: '2024-01-08',
            status: 'new',
            source: 'discovery',
            campaignHistory: []
          }
        ]

        const mockCampaigns: EmailCampaign[] = [
          {
            id: 'camp-1',
            name: 'Smart Home Partnership Intro',
            subject: 'Partnership Opportunity: Smart Home Integration',
            content: 'Hello! We specialize in smart home technology and would love to explore partnership opportunities...',
            targetTypes: ['interior-designer', 'builder'],
            status: 'sent',
            sentDate: '2024-01-11',
            createdAt: '2024-01-10',
            recipients: ['fp-1', 'fp-2'],
            analytics: {
              sent: 15,
              delivered: 14,
              opened: 8,
              clicked: 3,
              replied: 1,
              bounced: 1,
              unsubscribed: 0,
              conversionRate: 6.7,
              openRate: 57.1,
              clickRate: 37.5
            }
          }
        ]

        setFuturePartners(mockFuturePartners)
        setEmailCampaigns(mockCampaigns)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredPartners = futurePartners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  const getEngagementStats = () => {
    const totalPartners = futurePartners.length
    const contactedPartners = futurePartners.filter(p => p.status !== 'new').length
    const interestedPartners = futurePartners.filter(p => p.status === 'interested').length
    const convertedPartners = futurePartners.filter(p => p.status === 'converted').length
    
    return {
      totalPartners,
      contactedPartners,
      interestedPartners,
      convertedPartners,
      engagementRate: totalPartners > 0 ? (contactedPartners / totalPartners * 100).toFixed(1) : '0',
      conversionRate: contactedPartners > 0 ? (convertedPartners / contactedPartners * 100).toFixed(1) : '0'
    }
  }

  const stats = getEngagementStats()

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
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Future Partners</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Nurture discovered partners through email campaigns
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/future-partners/templates')}>
                <Mail className="mr-2 h-4 w-4" />
                Templates
              </Button>
              <Button variant="outline" onClick={() => router.push('/future-partners/campaigns/new')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
              <Button onClick={() => router.push('/partners')}>
                <Search className="mr-2 h-4 w-4" />
                Discover More
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="prospects" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Prospects ({futurePartners.length})
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Campaigns ({emailCampaigns.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Prospects Tab */}
          <TabsContent value="prospects" className="space-y-6">
            {/* Search and filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search future partners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="interested">Interested</SelectItem>
                      <SelectItem value="not-interested">Not Interested</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Partners grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading future partners...</p>
              </div>
            ) : filteredPartners.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No future partners found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'Start discovering partners to build your pipeline'}
                  </p>
                  <Button onClick={() => router.push('/partners')}>
                    <Search className="mr-2 h-4 w-4" />
                    Discover Partners
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPartners.map((partner) => (
                  <Card 
                    key={partner.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(`/future-partners/${partner.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{partner.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {partner.address.split(',')[1]?.trim()}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge className={getPartnerTypeColor(partner.type)}>
                            {formatPartnerType(partner.type)}
                          </Badge>
                          <Badge className={getStatusColor(partner.status)}>
                            {partner.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Contact Info */}
                      <div className="space-y-2 text-sm">
                        {partner.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{partner.email}</span>
                          </div>
                        )}
                        {partner.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-4 w-4" />
                            <span>{partner.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Added {new Date(partner.discoveredDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Campaign History Summary */}
                      {partner.campaignHistory.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Campaign History</h4>
                          <div className="text-xs text-gray-600">
                            {partner.campaignHistory.length} campaign{partner.campaignHistory.length !== 1 ? 's' : ''} sent
                            {partner.campaignHistory.some(h => h.status === 'opened') && (
                              <span className="text-green-600 ml-2">• Opened</span>
                            )}
                            {partner.campaignHistory.some(h => h.status === 'replied') && (
                              <span className="text-blue-600 ml-2">• Replied</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Specialties */}
                      {partner.specialties && partner.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {partner.specialties.slice(0, 2).map((specialty, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                          {partner.specialties.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{partner.specialties.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            {/* Campaign Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Active Campaigns</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push('/future-partners/templates')}>
                  <Mail className="mr-2 h-4 w-4" />
                  Browse Templates
                </Button>
                <Button onClick={() => router.push('/future-partners/campaigns/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Campaign
                </Button>
              </div>
            </div>

            {/* Campaign List */}
            {emailCampaigns.length > 0 ? (
              <div className="grid gap-4">
                {emailCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <CardDescription>{campaign.subject}</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                            campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {campaign.status}
                          </Badge>
                          {campaign.sentDate && (
                            <span className="text-sm text-gray-500">
                              {new Date(campaign.sentDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">{campaign.analytics.sent}</p>
                          <p className="text-sm text-gray-600">Sent</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{campaign.analytics.delivered}</p>
                          <p className="text-sm text-gray-600">Delivered</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{campaign.analytics.opened}</p>
                          <p className="text-sm text-gray-600">Opened ({campaign.analytics.openRate}%)</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">{campaign.analytics.clicked}</p>
                          <p className="text-sm text-gray-600">Clicked ({campaign.analytics.clickRate}%)</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-emerald-600">{campaign.analytics.replied}</p>
                          <p className="text-sm text-gray-600">Replied</p>
                        </div>
                      </div>
                      
                      {/* Target Types */}
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm text-gray-500">Targeted:</span>
                        {campaign.targetTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first email campaign to start nurturing partners
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => router.push('/future-partners/templates')}>
                      Browse Templates
                    </Button>
                    <Button onClick={() => router.push('/future-partners/campaigns/new')}>
                      Create Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Engagement Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Prospects</p>
                      <p className="text-3xl font-bold">{stats.totalPartners}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                      <p className="text-3xl font-bold">{stats.engagementRate}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Interested</p>
                      <p className="text-3xl font-bold">{stats.interestedPartners}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                      <p className="text-3xl font-bold">{stats.conversionRate}%</p>
                    </div>
                    <UserPlus className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Campaign Performance */}
            {emailCampaigns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>
                    Track the effectiveness of your outreach campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emailCampaigns.map((campaign) => (
                      <div key={campaign.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{campaign.name}</h4>
                            <p className="text-sm text-gray-600">{campaign.subject}</p>
                          </div>
                          <Badge className={
                            campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
                            campaign.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                            'bg-blue-100 text-blue-700'
                          }>
                            {campaign.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Send className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm text-gray-600">Sent</p>
                              <p className="font-semibold">{campaign.analytics.sent}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-sm text-gray-600">Opened</p>
                              <p className="font-semibold">{campaign.analytics.opened} ({campaign.analytics.openRate}%)</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MousePointer className="h-4 w-4 text-purple-600" />
                            <div>
                              <p className="text-sm text-gray-600">Clicked</p>
                              <p className="font-semibold">{campaign.analytics.clicked} ({campaign.analytics.clickRate}%)</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Reply className="h-4 w-4 text-emerald-600" />
                            <div>
                              <p className="text-sm text-gray-600">Replied</p>
                              <p className="font-semibold">{campaign.analytics.replied}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}