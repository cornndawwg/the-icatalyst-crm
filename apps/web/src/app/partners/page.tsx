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
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Building2,
  MapPin,
  Loader2,
  ExternalLink,
  UserPlus
} from 'lucide-react'
import { partnersApi, discoveryApi } from '@/lib/api'
import type { Partner, DiscoveredPartner } from '@/types'

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('my-partners')
  
  // Discovery search state
  const [discoveryLocation, setDiscoveryLocation] = useState('')
  const [discoveryRadius, setDiscoveryRadius] = useState('25')
  const [discoveryTypes, setDiscoveryTypes] = useState<string[]>(['interior-designer', 'builder', 'architect'])
  const [discoveryResults, setDiscoveryResults] = useState<DiscoveredPartner[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await partnersApi.getAll()
        setPartners(data)
      } catch (error) {
        console.error('Error fetching partners:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPartners()
  }, [])

  const filteredPartners = partners.filter(partner =>
    partner.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const getPartnerStats = (partner: Partner) => {
    const projectCount = partner.leads?.filter(lead => lead.status === 'won')?.length || 0
    const totalLeads = partner.leads?.length || 0
    const estimatedRevenue = projectCount * 5000 // $5k average project value
    const conversionRate = totalLeads > 0 ? (projectCount / totalLeads * 100).toFixed(1) : '0'
    
    return {
      projectCount,
      totalLeads,
      estimatedRevenue,
      conversionRate
    }
  }

  const handlePartnerTypeToggle = (type: string) => {
    setDiscoveryTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const handleDiscoverySearch = async () => {
    if (!discoveryLocation.trim()) {
      alert('Please enter a location to search')
      return
    }

    setIsSearching(true)
    try {
      // TODO: Replace with actual API call
      // const results = await discoveryApi.searchPartners({
      //   location: discoveryLocation,
      //   radius: parseInt(discoveryRadius),
      //   types: discoveryTypes
      // })
      
      // Mock results for now
      const mockResults: DiscoveredPartner[] = [
        {
          id: 'disc-1',
          name: 'Elite Design Studio',
          type: 'interior-designer' as const,
          address: '123 Main St, ' + discoveryLocation,
          phone: '(555) 123-4567',
          website: 'https://elitedesignstudio.com',
          rating: 4.8,
          reviewCount: 127,
          specialties: ['Modern Design', 'Kitchen Renovation', 'Luxury Homes'],
          distance: '2.3 miles'
        },
        {
          id: 'disc-2',
          name: 'Premium Home Builders',
          type: 'builder' as const,
          address: '456 Oak Ave, ' + discoveryLocation,
          phone: '(555) 234-5678',
          website: 'https://premiumhomebuilders.com',
          rating: 4.9,
          reviewCount: 89,
          specialties: ['Custom Homes', 'Smart Home Integration', 'Luxury Construction'],
          distance: '3.7 miles'
        },
        {
          id: 'disc-3',
          name: 'Modern Architecture Firm',
          type: 'architect' as const,
          address: '789 Pine St, ' + discoveryLocation,
          phone: '(555) 345-6789',
          website: 'https://modernarchfirm.com',
          rating: 4.7,
          reviewCount: 156,
          specialties: ['Contemporary Design', 'Sustainable Architecture', 'Residential Projects'],
          distance: '1.8 miles'
        }
      ].filter(result => discoveryTypes.includes(result.type))
      
      setDiscoveryResults(mockResults)
    } catch (error) {
      console.error('Error searching partners:', error)
      alert('Error searching for partners. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddDiscoveredPartner = async (discoveredPartner: DiscoveredPartner) => {
    try {
      await discoveryApi.addDiscoveredPartner({
        name: discoveredPartner.name,
        type: discoveredPartner.type,
        address: discoveredPartner.address,
        phone: discoveredPartner.phone,
        website: discoveredPartner.website,
        specialties: discoveredPartner.specialties,
        rating: discoveredPartner.rating,
        reviewCount: discoveredPartner.reviewCount
      })
      
      // Refresh partners list
      const updatedPartners = await partnersApi.getAll()
      setPartners(updatedPartners)
      
      alert(`${discoveredPartner.name} has been added to your CRM!`)
    } catch (error) {
      console.error('Error adding partner:', error)
      alert('Error adding partner to CRM. Please try again.')
    }
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
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Partnership Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage relationships and discover new partners
                </p>
              </div>
            </div>
            {activeTab === 'my-partners' && (
              <Button onClick={() => router.push('/partners/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Partner
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="my-partners" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              My Partners ({partners.length})
            </TabsTrigger>
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Discover Partners
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-partners" className="space-y-6">
            {/* Search and filters for existing partners */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search your partners..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

        {/* Partners grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading partners...</p>
          </div>
        ) : filteredPartners.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No partners found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first partner'}
              </p>
              <Button onClick={() => router.push('/partners/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Partner
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => {
              const stats = getPartnerStats(partner)
              return (
                <Card 
                  key={partner.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/partners/${partner.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{partner.companyName}</CardTitle>
                        <CardDescription>{partner.contactName}</CardDescription>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getPartnerTypeColor(partner.type)}
                      >
                        {formatPartnerType(partner.type)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Contact Information */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{partner.email}</span>
                      </div>
                      {partner.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span>{partner.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Partnership Performance Stats */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Partnership Performance</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Projects</p>
                            <p className="text-sm font-semibold">{stats.projectCount}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-600">Conv. Rate</p>
                            <p className="text-sm font-semibold">{stats.conversionRate}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3 text-emerald-600" />
                          <div>
                            <p className="text-xs text-gray-600">Revenue</p>
                            <p className="text-sm font-semibold">${stats.estimatedRevenue.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-600">Total Leads</p>
                            <p className="text-sm font-semibold">{stats.totalLeads}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Specialties */}
                    {partner.specialties && partner.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {partner.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {partner.specialties.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{partner.specialties.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
          </TabsContent>

          <TabsContent value="discover" className="space-y-6">
            {/* Partner Discovery Search */}
            <Card>
              <CardHeader>
                <CardTitle>Discover New Partners</CardTitle>
                <CardDescription>
                  Find local interior designers, custom home builders, and architects to grow your network
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Location Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="City, State or ZIP"
                        value={discoveryLocation}
                        onChange={(e) => setDiscoveryLocation(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Radius Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search Radius</label>
                    <Select value={discoveryRadius} onValueChange={setDiscoveryRadius}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 miles</SelectItem>
                        <SelectItem value="25">25 miles</SelectItem>
                        <SelectItem value="50">50 miles</SelectItem>
                        <SelectItem value="100">100 miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Partner Types */}
                  <div className="space-y-2 md:col-span-2 lg:col-span-1">
                    <label className="text-sm font-medium">Partner Types</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'interior-designer', label: 'Interior Designers' },
                        { value: 'builder', label: 'Builders' },
                        { value: 'architect', label: 'Architects' }
                      ].map(({ value, label }) => (
                        <Button
                          key={value}
                          variant={discoveryTypes.includes(value) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePartnerTypeToggle(value)}
                          className="text-xs"
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Search Button */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium invisible">Search</label>
                    <Button 
                      onClick={handleDiscoverySearch}
                      disabled={isSearching || !discoveryLocation.trim()}
                      className="w-full"
                    >
                      {isSearching ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Search Partners
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            {discoveryResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>
                    Found {discoveryResults.length} potential partners in {discoveryLocation}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {discoveryResults.map((result) => (
                      <Card key={result.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{result.name}</CardTitle>
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3" />
                                {result.distance}
                              </CardDescription>
                            </div>
                            <Badge className={getPartnerTypeColor(result.type)}>
                              {formatPartnerType(result.type)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Contact Info */}
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate">{result.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{result.phone}</span>
                            </div>
                            {result.website && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <ExternalLink className="h-4 w-4" />
                                <a 
                                  href={result.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline truncate"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Visit Website
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <span className="text-yellow-500">★</span>
                              <span className="text-sm font-medium ml-1">{result.rating}</span>
                            </div>
                            <span className="text-sm text-gray-500">({result.reviewCount} reviews)</span>
                          </div>

                          {/* Specialties */}
                          {result.specialties && result.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {result.specialties.slice(0, 3).map((specialty: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                              {result.specialties.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{result.specialties.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Action Button */}
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddDiscoveredPartner(result)
                            }}
                            className="w-full"
                            size="sm"
                          >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add to CRM
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State for No Results */}
            {!isSearching && discoveryResults.length === 0 && discoveryLocation && (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No partners found</h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search location, radius, or partner types.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}