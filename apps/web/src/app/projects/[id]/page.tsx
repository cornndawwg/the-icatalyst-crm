'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  ArrowLeft,
  Building2,
  User,
  FileText,
  Users,
  Activity,
  Edit,
  Save,
  X,
  Plus,
  CheckCircle,
  AlertCircle,
  Download,
  Settings
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
  materialsCost?: number
  laborCost?: number
  hardwareCost?: number
  startDate?: string
  endDate?: string
  projectedFinishDate?: string
  materialDeliveryDate?: string
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  primaryPartner?: {
    id: string
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
    id: string
    role?: string
    partner: {
      id: string
      companyName: string
      contactName: string
      type: string
    }
  }>
  projectMembers: Array<{
    id: string
    userId: string
    role: string
    isLaborer: boolean
  }>
  documents: Array<{
    id: string
    name: string
    fileName: string
    fileUrl: string
    fileSize: number
    category: string
    uploadedAt: string
  }>
  tasks: Array<{
    id: string
    title: string
    description?: string
    status: string
    priority: string
    dueDate?: string
    assignedTo?: string
    completedAt?: string
  }>
  changeOrders: Array<{
    id: string
    title: string
    description: string
    reason: string
    costChange: number
    status: string
    createdAt: string
  }>
  activityLogs: Array<{
    id: string
    type: string
    title: string
    description?: string
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
}

interface Partner {
  id: string
  companyName: string
  contactName: string
  type: string
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params?.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingOverview, setEditingOverview] = useState(false)
  const [editingFinancials, setEditingFinancials] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Edit states
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    status: '',
    progressPercent: 0,
    estimatedValue: '',
    actualCost: '',
    materialsCost: '',
    laborCost: '',
    hardwareCost: '',
    startDate: '',
    endDate: '',
    projectedFinishDate: '',
    materialDeliveryDate: ''
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

    if (checkAuth() && projectId) {
      loadProject()
    }
  }, [router, projectId])

  const loadProject = async () => {
    try {
      setLoading(true)
      const projectData = await projectsApi.getById(projectId)
      setProject(projectData)
      
      // Initialize edit form
      setEditForm({
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status,
        progressPercent: projectData.progressPercent,
        estimatedValue: projectData.estimatedValue?.toString() || '',
        actualCost: projectData.actualCost?.toString() || '',
        materialsCost: projectData.materialsCost?.toString() || '',
        laborCost: projectData.laborCost?.toString() || '',
        hardwareCost: projectData.hardwareCost?.toString() || '',
        startDate: projectData.startDate ? projectData.startDate.split('T')[0] : '',
        endDate: projectData.endDate ? projectData.endDate.split('T')[0] : '',
        projectedFinishDate: projectData.projectedFinishDate ? projectData.projectedFinishDate.split('T')[0] : '',
        materialDeliveryDate: projectData.materialDeliveryDate ? projectData.materialDeliveryDate.split('T')[0] : ''
      })
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveOverview = async () => {
    try {
      const updateData = {
        name: editForm.name,
        description: editForm.description,
        status: editForm.status,
        progressPercent: editForm.progressPercent,
        startDate: editForm.startDate || undefined,
        endDate: editForm.endDate || undefined,
        projectedFinishDate: editForm.projectedFinishDate || undefined,
        materialDeliveryDate: editForm.materialDeliveryDate || undefined
      }

      await projectsApi.update(projectId, updateData)
      await loadProject()
      setEditingOverview(false)
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project')
    }
  }

  const handleSaveFinancials = async () => {
    try {
      const updateData = {
        estimatedValue: editForm.estimatedValue ? Number(editForm.estimatedValue) : undefined,
        actualCost: editForm.actualCost ? Number(editForm.actualCost) : undefined,
        materialsCost: editForm.materialsCost ? Number(editForm.materialsCost) : undefined,
        laborCost: editForm.laborCost ? Number(editForm.laborCost) : undefined,
        hardwareCost: editForm.hardwareCost ? Number(editForm.hardwareCost) : undefined
      }

      await projectsApi.update(projectId, updateData)
      await loadProject()
      setEditingFinancials(false)
    } catch (error) {
      console.error('Error updating project financials:', error)
      alert('Failed to update project financials')
    }
  }

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

  const calculateProfitMargin = () => {
    if (!project?.estimatedValue || !project?.actualCost) return 0
    return ((project.estimatedValue - project.actualCost) / project.estimatedValue) * 100
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/projects')}>
            Back to Projects
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
                onClick={() => router.push('/projects')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(project.status)}
                  >
                    {project.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {project.customer.firstName} {project.customer.lastName} • 
                  {project.primaryPartner ? ` ${project.primaryPartner.companyName} • ` : ' '}
                  {project.projectType.replace('-', ' ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Info */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Project Information</CardTitle>
                    {editingOverview ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveOverview}>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setEditingOverview(false)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setEditingOverview(true)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editingOverview ? (
                      <>
                        <div>
                          <Label htmlFor="name">Project Name</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="status">Status</Label>
                            <Select 
                              value={editForm.status} 
                              onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="planning">Planning</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="on-hold">On Hold</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="progress">Progress (%)</Label>
                            <Input
                              id="progress"
                              type="number"
                              min="0"
                              max="100"
                              value={editForm.progressPercent}
                              onChange={(e) => setEditForm(prev => ({ 
                                ...prev, 
                                progressPercent: parseInt(e.target.value) || 0 
                              }))}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {project.description || 'No description provided'}
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{project.progressPercent}%</span>
                          </div>
                          <Progress value={project.progressPercent} className="h-2" />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Key Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Tasks</span>
                      </div>
                      <span className="font-medium">{project.tasks.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Team Members</span>
                      </div>
                      <span className="font-medium">{project.projectMembers.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Documents</span>
                      </div>
                      <span className="font-medium">{project.documents.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Change Orders</span>
                      </div>
                      <span className="font-medium">{project.changeOrders.length}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Key Dates</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date</span>
                      <span>{formatDate(project.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Projected Finish</span>
                      <span>{formatDate(project.projectedFinishDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Material Delivery</span>
                      <span>{formatDate(project.materialDeliveryDate)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Customer & Partners */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{project.customer.firstName} {project.customer.lastName}</h4>
                      <p className="text-sm text-gray-600">{project.customer.email}</p>
                      <p className="text-sm text-gray-600">{project.customer.phone}</p>
                    </div>
                  </div>
                  
                  {project.property && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium text-sm mb-2">Project Property</h5>
                      <p className="text-sm text-gray-600">
                        {project.property.name}<br />
                        {project.property.address}<br />
                        {project.property.city}, {project.property.state}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Partners */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Partners</CardTitle>
                  <Button size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Partner
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.primaryPartner && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{project.primaryPartner.companyName}</h4>
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          {project.primaryPartner.contactName} • {project.primaryPartner.type.replace('-', ' ')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {project.projectPartners.map((projectPartner) => (
                    <div key={projectPartner.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Building2 className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{projectPartner.partner.companyName}</h4>
                        <p className="text-xs text-gray-600">
                          {projectPartner.partner.contactName} • {projectPartner.role || 'Collaborator'}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {!project.primaryPartner && project.projectPartners.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No partners assigned to this project
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Budget Overview */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Budget Overview</CardTitle>
                  {editingFinancials ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveFinancials}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setEditingFinancials(false)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => setEditingFinancials(true)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingFinancials ? (
                    <>
                      <div>
                        <Label htmlFor="estimatedValue">Estimated Value</Label>
                        <Input
                          id="estimatedValue"
                          type="number"
                          value={editForm.estimatedValue}
                          onChange={(e) => setEditForm(prev => ({ ...prev, estimatedValue: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="actualCost">Actual Cost</Label>
                        <Input
                          id="actualCost"
                          type="number"
                          value={editForm.actualCost}
                          onChange={(e) => setEditForm(prev => ({ ...prev, actualCost: e.target.value }))}
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="materialsCost">Materials</Label>
                          <Input
                            id="materialsCost"
                            type="number"
                            value={editForm.materialsCost}
                            onChange={(e) => setEditForm(prev => ({ ...prev, materialsCost: e.target.value }))}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="laborCost">Labor</Label>
                          <Input
                            id="laborCost"
                            type="number"
                            value={editForm.laborCost}
                            onChange={(e) => setEditForm(prev => ({ ...prev, laborCost: e.target.value }))}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="hardwareCost">Hardware</Label>
                          <Input
                            id="hardwareCost"
                            type="number"
                            value={editForm.hardwareCost}
                            onChange={(e) => setEditForm(prev => ({ ...prev, hardwareCost: e.target.value }))}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Estimated Value</span>
                        <span className="font-semibold text-lg">{formatCurrency(project.estimatedValue)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Actual Cost</span>
                        <span className="font-semibold">{formatCurrency(project.actualCost)}</span>
                      </div>
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Profit Margin</span>
                          <span className={`font-semibold ${
                            calculateProfitMargin() >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {calculateProfitMargin().toFixed(1)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.max(0, calculateProfitMargin())} 
                          className="h-2"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Materials</span>
                    <span className="font-medium">{formatCurrency(project.materialsCost)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Labor</span>
                    <span className="font-medium">{formatCurrency(project.laborCost)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hardware</span>
                    <span className="font-medium">{formatCurrency(project.hardwareCost)}</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Costs</span>
                      <span>{formatCurrency(project.actualCost)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Change Orders */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Change Orders</CardTitle>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Change Order
                </Button>
              </CardHeader>
              <CardContent>
                {project.changeOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No change orders for this project</p>
                ) : (
                  <div className="space-y-4">
                    {project.changeOrders.map((changeOrder) => (
                      <div key={changeOrder.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{changeOrder.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              changeOrder.status === 'approved' ? 'default' :
                              changeOrder.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {changeOrder.status}
                            </Badge>
                            <span className={`font-medium ${
                              changeOrder.costChange >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {changeOrder.costChange >= 0 ? '+' : ''}{formatCurrency(changeOrder.costChange)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{changeOrder.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {changeOrder.reason} • {formatDate(changeOrder.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other tabs would be implemented here */}
          <TabsContent value="team">
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Team Management</h3>
                <p className="text-gray-600">Team member assignment and management coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks">
            <Card>
              <CardContent className="py-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Task Management</h3>
                <p className="text-gray-600">Project task management interface coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardContent className="py-8 text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Activity Log</h3>
                <p className="text-gray-600">Project activity tracking and notes coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}