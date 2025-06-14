'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Calendar,
  Home,
  UserPlus,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { partnersApi } from '@/lib/api'
import type { User, Organization } from '@/types'

interface DashboardStats {
  totalPartners: number
  activeProjects: number
  monthlyRevenue: number
  newLeads: number
}

interface NavigationItem {
  name: string
  href: string
  icon: any
  current: boolean
  children?: NavigationItem[]
}

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['partners'])
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        // Get user data from localStorage or fetch from API
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

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user')
    localStorage.removeItem('organization')
    router.push('/login')
  }

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, current: true },
    { 
      name: 'Partners', 
      href: '/partners', 
      icon: Users, 
      current: false,
      children: [
        { name: 'My Partners', href: '/partners', icon: Users, current: false },
        { name: 'Future Partners', href: '/future-partners', icon: Search, current: false },
      ]
    },
    { name: 'Projects', href: '/projects', icon: FileText, current: false },
    { name: 'Leads', href: '/leads', icon: UserPlus, current: false },
    { name: 'Calendar', href: '/calendar', icon: Calendar, current: false },
    { name: 'Settings', href: '/settings', icon: Settings, current: false },
  ]

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName) 
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-6 border-b">
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">iCatalyst CRM</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  {item.children ? (
                    <>
                      <Button
                        variant="ghost"
                        className="w-full justify-between"
                        onClick={() => toggleSection(item.name.toLowerCase())}
                      >
                        <div className="flex items-center">
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </div>
                        {expandedSections.includes(item.name.toLowerCase()) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      {expandedSections.includes(item.name.toLowerCase()) && (
                        <ul className="ml-6 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.name}>
                              <Button
                                variant={child.current ? "secondary" : "ghost"}
                                className="w-full justify-start text-sm"
                                onClick={() => router.push(child.href)}
                              >
                                <child.icon className="mr-3 h-4 w-4" />
                                {child.name}
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <Button
                      variant={item.current ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => router.push(item.href)}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* User info and logout */}
          <div className="border-t px-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {organization?.name || 'Your Smart Home Integration Business'}
                </p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Active Plan
              </Badge>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          {/* Quick actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to help you get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  className="w-full" 
                  onClick={() => router.push('/partners/new')}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Partner
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/projects/new')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  New Project
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/leads')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  View Leads
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/calendar')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Meeting
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent activity placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest partner interactions and project updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New partner added: ABC Interior Design</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Project completed: Smart Home Installation</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New lead from website: John Smith</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}