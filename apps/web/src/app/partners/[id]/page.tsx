'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Globe,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { partnersApi } from '@/lib/api'
import type { Partner } from '@/types'

export default function PartnerDetailPage() {
  const [partner, setPartner] = useState<Partner | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const partnerId = params.id as string

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const data = await partnersApi.getById(partnerId)
        setPartner(data)
      } catch (error) {
        console.error('Error fetching partner:', error)
        router.push('/partners')
      } finally {
        setIsLoading(false)
      }
    }

    if (partnerId) {
      fetchPartner()
    }
  }, [partnerId, router])

  const handleDelete = async () => {
    if (!partner || !confirm('Are you sure you want to delete this partner?')) {
      return
    }

    try {
      await partnersApi.delete(partner.id)
      router.push('/partners')
    } catch (error) {
      console.error('Error deleting partner:', error)
      alert('Failed to delete partner')
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

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (score >= 50) return <Minus className="h-4 w-4 text-yellow-600" />
    return <TrendingDown className="h-4 w-4 text-red-600" />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!partner) {
    return null
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
                onClick={() => router.push('/partners')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {partner.companyName}
                  </h1>
                  <Badge className={getPartnerTypeColor(partner.type)}>
                    {formatPartnerType(partner.type)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {partner.contactName}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/partners/${partner.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Partner Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a href={`mailto:${partner.email}`} className="text-blue-600 hover:underline">
                    {partner.email}
                  </a>
                </div>
                {partner.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <a href={`tel:${partner.phone}`} className="text-blue-600 hover:underline">
                      {partner.phone}
                    </a>
                  </div>
                )}
                {partner.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a 
                      href={partner.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {partner.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Relationship Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{partner.relationshipScore}</span>
                  {getScoreIcon(partner.relationshipScore)}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Based on interaction history and outcomes
                </p>
              </CardContent>
            </Card>

            {partner.specialties && partner.specialties.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {partner.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {partner.notes && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {partner.notes}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Activity and Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="interactions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="interactions">Interactions</TabsTrigger>
                <TabsTrigger value="leads">Leads</TabsTrigger>
              </TabsList>

              <TabsContent value="interactions" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Interactions</CardTitle>
                    <CardDescription>
                      Track all communications and meetings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {partner.interactions && partner.interactions.length > 0 ? (
                      <div className="space-y-4">
                        {partner.interactions.map((interaction) => (
                          <div key={interaction.id} className="border-b pb-4 last:border-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{interaction.subject}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {interaction.description}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                  <span className="text-xs text-gray-500">
                                    {interaction.type}
                                  </span>
                                  <Badge
                                    variant={
                                      interaction.outcome === 'positive' ? 'default' :
                                      interaction.outcome === 'negative' ? 'destructive' :
                                      'secondary'
                                    }
                                  >
                                    {interaction.outcome}
                                  </Badge>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(interaction.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No interactions recorded yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="leads" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Partner Leads</CardTitle>
                    <CardDescription>
                      Leads attributed to this partner
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {partner.leads && partner.leads.length > 0 ? (
                      <div className="space-y-4">
                        {partner.leads.map((lead) => (
                          <div key={lead.id} className="border-b pb-4 last:border-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">
                                  {lead.customer?.name || 'Unknown Customer'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {lead.customer?.email}
                                </p>
                                <Badge
                                  className={`mt-2 ${
                                    lead.status === 'won' ? 'bg-green-100 text-green-700 border-green-200' : ''
                                  }`}
                                  variant={
                                    lead.status === 'active' ? 'default' :
                                    lead.status === 'won' ? 'outline' :
                                    'secondary'
                                  }
                                >
                                  {lead.status}
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(lead.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No leads from this partner yet</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}