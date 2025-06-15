'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  FolderOpen, 
  Users, 
  TrendingUp,
  DollarSign,
  Calendar,
  Mail,
  UserPlus,
  FileText,
  Plus
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { partnersApi } from '@/lib/api'
import type { User, Organization } from '@/types'

interface DashboardStats {
  totalPartners: number
  activeProjects: number
  monthlyRevenue: number
  newLeads: number
}

const quickActions = [
  {
    title: 'Add New Project',
    description: 'Create a new smart home project',
    icon: FolderOpen,
    href: '/projects/new',
    color: 'bg-blue-600'
  },
  {
    title: 'Add Partner',
    description: 'Register a new business partner',
    icon: Building2,
    href: '/partners/new',
    color: 'bg-green-600'
  },
  {
    title: 'Send Campaign',
    description: 'Launch an email campaign',
    icon: Mail,
    href: '/future-partners',
    color: 'bg-purple-600'
  },
  {
    title: 'Schedule Meeting',
    description: 'Book partner consultation',
    icon: Calendar,
    href: '/calendar',
    color: 'bg-orange-600'
  }
]

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalPartners: 0,
    activeProjects: 0,
    monthlyRevenue: 0,
    newLeads: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get user data from localStorage
        const storedUser = localStorage.getItem('user')
        const storedOrg = localStorage.getItem('organization')
        
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
        if (storedOrg) {
          setOrganization(JSON.parse(storedOrg))
        }

        // Fetch dashboard data
        const partners = await partnersApi.getAll()
        
        // Calculate stats from real data
        const totalPartners = partners.length || 0
        
        // Count active leads from partners
        const activeLeads = partners.reduce((count: number, partner: { leads?: { status: string }[] }) => {
          return count + (partner.leads?.filter((lead) => lead.status === 'active')?.length || 0)
        }, 0)
        
        // Count total leads
        const totalLeads = partners.reduce((count: number, partner: { leads?: unknown[] }) => {
          return count + (partner.leads?.length || 0)
        }, 0)
        
        // Calculate estimated revenue (placeholder calculation)
        const monthlyRevenue = totalLeads * 5000 // $5k average project value
        
        setStats({
          totalPartners,
          activeProjects: activeLeads, // Using active leads as proxy for projects
          monthlyRevenue,
          newLeads: totalLeads
        })
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-gray-600">
                {organization?.name || 'Your Smart Home Integration Business'}
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 hidden sm:inline-flex">
              Active Plan
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPartners}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                3 completing this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +18% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLeads}</div>
              <p className="text-xs text-muted-foreground">
                This week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-6 md:mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to help you get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <Card 
                  key={action.title} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(action.href)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 ${action.color} rounded-lg`}>
                        <action.icon className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
                    </div>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Latest project activity</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/projects')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Smart Home Renovation', client: 'Johnson Residence', status: 'In Progress' },
                { name: 'Office Automation', client: 'TechCorp', status: 'Planning' },
                { name: 'Luxury Villa Setup', client: 'Williams Estate', status: 'Completed' }
              ].map((project, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{project.name}</p>
                    <p className="text-xs text-gray-600">{project.client}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {project.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Partners */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Partners</CardTitle>
                <CardDescription>Newest partner additions</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/partners')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: 'Elite Designs Co.', type: 'Interior Designer', projects: 3 },
                { name: 'Modern Builders LLC', type: 'General Contractor', projects: 5 },
                { name: 'Luxury Architects', type: 'Architect', projects: 2 }
              ].map((partner, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{partner.name}</p>
                      <p className="text-xs text-gray-600">{partner.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{partner.projects}</p>
                    <p className="text-xs text-gray-600">projects</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}