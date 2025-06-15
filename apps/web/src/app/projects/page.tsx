'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Search,
  Plus,
  Filter,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Clock,
  Building2,
  User,
  ArrowRight,
  Settings,
  Eye
} from 'lucide-react'
import { projectsApi, partnersApi } from '@/lib/api'

interface Project {
  id: string
  name: string
  description?: string
  status: string
  projectType: string
  progressPercent: number
  estimatedValue?: number
  actualCost?: number
  startDate?: string
  projectedFinishDate?: string
  customer: {
    firstName: string
    lastName: string
    email: string
  }
  primaryPartner?: {
    companyName: string
    contactName: string
    type: string
  }
  property?: {
    name: string
    address: string
    city: string
    state: string
  }
  projectPartners: Array<{
    partner: {
      companyName: string
      type: string
    }
  }>
  _count: {
    documents: number
    tasks: number
    changeOrders: number
  }
  createdAt: string
  updatedAt: string
}

interface Partner {
  id: string
  companyName: string
  type: string
}

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    partnerId: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth-token')
        if (!token) {
          router.push('/login')
          return false
        }
      }
      return true
    }

    if (checkAuth()) {
      loadData()
    }
  }, [router, filters, pagination.page, loadData])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      const [projectsResponse, partnersResponse] = await Promise.all([
        projectsApi.getAll({
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        }),
        partnersApi.getAll()
      ])
      
      setProjects(projectsResponse.projects || [])
      setPagination(prev => ({
        ...prev,
        total: projectsResponse.pagination?.total || 0,
        totalPages: projectsResponse.pagination?.totalPages || 0
      }))
      setPartners(partnersResponse || [])
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.page, pagination.limit])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'on-hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'new-install': return <Building2 className="h-4 w-4" />
      case 'upgrade': return <ArrowRight className="h-4 w-4" />
      case 'service': return <Settings className="h-4 w-4" />
      case 'design-only': return <Eye className="h-4 w-4" />
      default: return <Building2 className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const resetFilters = () => {
    setFilters({
      status: '',
      partnerId: '',
      search: ''
    })
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your smart home integration projects with partner attribution
              </p>
            </div>
            <Button onClick={() => router.push('/projects/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              {/* Partner Filter */}
              <Select 
                value={filters.partnerId} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, partnerId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Partners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Partners</SelectItem>
                  {partners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id}>
                      {partner.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Reset */}
              <Button variant="outline" onClick={resetFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-6">
                {Object.values(filters).some(f => f) 
                  ? "No projects match your current filters. Try adjusting your search criteria."
                  : "Get started by creating your first project."
                }
              </p>
              {!Object.values(filters).some(f => f) && (
                <Button onClick={() => router.push('/projects/new')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Project
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getProjectTypeIcon(project.projectType)}
                          <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {project.description || 'No description provided'}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`ml-2 ${getStatusColor(project.status)}`}
                      >
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{project.progressPercent}%</span>
                      </div>
                      <Progress value={project.progressPercent} className="h-2" />
                    </div>

                    {/* Customer & Partner */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          {project.customer.firstName} {project.customer.lastName}
                        </span>
                      </div>
                      
                      {project.primaryPartner && (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600 truncate">
                            {project.primaryPartner.companyName}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {project.primaryPartner.type.replace('-', ' ')}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Financial */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Budget</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(project.estimatedValue)}
                      </span>
                    </div>

                    {/* Dates */}
                    {project.projectedFinishDate && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Due</span>
                        </div>
                        <span className="font-medium">
                          {formatDate(project.projectedFinishDate)}
                        </span>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {project._count.tasks} tasks
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {project._count.documents} docs
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(project.updatedAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} projects
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}