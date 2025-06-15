'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Building2,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react'
import { projectsApi, partnersApi } from '@/lib/api'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  properties?: Property[]
}

interface Property {
  id: string
  name: string
  address: string
  city: string
  state: string
}

interface Partner {
  id: string
  companyName: string
  contactName: string
  type: string
}

interface ProjectTemplate {
  id: string
  name: string
  description?: string
  category: string
  projectType: string
  defaultBudget?: number
  estimatedDuration?: number
}

export default function NewProjectPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [partners, setPartners] = useState<Partner[]>([])
  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    projectType: '',
    customerId: '',
    propertyId: 'none',
    primaryPartnerId: 'none',
    
    // Dates
    startDate: '',
    projectedFinishDate: '',
    materialDeliveryDate: '',
    
    // Financial
    estimatedValue: '',
    
    // Template
    templateId: 'none',
    useTemplate: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

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
  }, [router])

  const loadData = async () => {
    try {
      // For now, we'll load empty arrays since we need to create customer and template APIs
      // In a real implementation, these would be:
      // const [customersRes, partnersRes, templatesRes] = await Promise.all([
      //   customersApi.getAll(),
      //   partnersApi.getAll(),
      //   projectTemplatesApi.getAll()
      // ])
      
      const partnersRes = await partnersApi.getAll()
      setPartners(partnersRes || [])
      
      // Mock customers for now - replace with real API call
      setCustomers([])
      setTemplates([])
      
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {}

    switch (stepNumber) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Project name is required'
        if (!formData.projectType) newErrors.projectType = 'Project type is required'
        if (!formData.customerId) newErrors.customerId = 'Customer is required'
        break
      case 2:
        if (formData.estimatedValue && isNaN(Number(formData.estimatedValue))) {
          newErrors.estimatedValue = 'Invalid budget amount'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    try {
      setLoading(true)
      
      const projectData = {
        name: formData.name,
        description: formData.description || undefined,
        projectType: formData.projectType as 'new-install' | 'upgrade' | 'service' | 'design-only',
        customerId: formData.customerId,
        propertyId: formData.propertyId === 'none' ? undefined : formData.propertyId || undefined,
        primaryPartnerId: formData.primaryPartnerId === 'none' ? undefined : formData.primaryPartnerId || undefined,
        startDate: formData.startDate || undefined,
        projectedFinishDate: formData.projectedFinishDate || undefined,
        materialDeliveryDate: formData.materialDeliveryDate || undefined,
        estimatedValue: formData.estimatedValue ? Number(formData.estimatedValue) : undefined,
        templateId: formData.templateId === 'none' ? undefined : formData.templateId || undefined
      }

      const project = await projectsApi.create(projectData)
      router.push(`/projects/${project.id}`)
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedCustomer = customers.find(c => c.id === formData.customerId)
  const selectedPartner = partners.find(p => p.id === formData.primaryPartnerId)
  const selectedTemplate = templates.find(t => t.id === formData.templateId)

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/projects')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
              <p className="text-sm text-gray-600 mt-1">
                Step {step} of 3 - Set up your smart home integration project
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center space-x-8">
          {[
            { num: 1, title: 'Basic Info', icon: Building2 },
            { num: 2, title: 'Details & Dates', icon: Calendar },
            { num: 3, title: 'Review & Create', icon: CheckCircle }
          ].map((stepItem) => (
            <div key={stepItem.num} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${step >= stepItem.num 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-400'
                }
              `}>
                {step > stepItem.num ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <stepItem.icon className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  step >= stepItem.num ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {stepItem.title}
                </p>
              </div>
              {stepItem.num < 3 && (
                <div className={`ml-8 w-16 h-0.5 ${
                  step > stepItem.num ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Basic Information</CardTitle>
                <CardDescription>
                  Start by providing the essential details about your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Selection */}
                <div>
                  <Label className="text-base font-medium">Would you like to use a project template?</Label>
                  <RadioGroup 
                    value={formData.useTemplate ? 'yes' : 'no'} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      useTemplate: value === 'yes',
                      templateId: value === 'no' ? 'none' : prev.templateId
                    }))}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="no-template" />
                      <Label htmlFor="no-template">Create from scratch</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yes" id="use-template" />
                      <Label htmlFor="use-template">Use a template</Label>
                    </div>
                  </RadioGroup>
                </div>

                {formData.useTemplate && (
                  <div>
                    <Label htmlFor="template">Project Template</Label>
                    <Select 
                      value={formData.templateId} 
                      onValueChange={(value) => {
                        setFormData(prev => ({ ...prev, templateId: value }))
                        // Auto-fill data from template
                        const template = templates.find(t => t.id === value)
                        if (template) {
                          setFormData(prev => ({
                            ...prev,
                            projectType: template.projectType,
                            estimatedValue: template.defaultBudget?.toString() || '',
                            description: template.description || ''
                          }))
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div>
                              <div className="font-medium">{template.name}</div>
                              <div className="text-sm text-gray-500">{template.category}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Project Name */}
                <div>
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Project Type */}
                <div>
                  <Label htmlFor="projectType">Project Type *</Label>
                  <Select 
                    value={formData.projectType} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, projectType: value }))}
                  >
                    <SelectTrigger className={errors.projectType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new-install">New Installation</SelectItem>
                      <SelectItem value="upgrade">System Upgrade</SelectItem>
                      <SelectItem value="service">Service Call</SelectItem>
                      <SelectItem value="design-only">Design Only</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.projectType && (
                    <p className="text-sm text-red-500 mt-1">{errors.projectType}</p>
                  )}
                </div>

                {/* Customer Selection */}
                <div>
                  <Label htmlFor="customer">Customer *</Label>
                  {customers.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-3">
                        No customers found. You&apos;ll need to add a customer first.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => window.open('/customers/new', '_blank')}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                      </Button>
                    </div>
                  ) : (
                    <Select 
                      value={formData.customerId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value, propertyId: 'none' }))}
                    >
                      <SelectTrigger className={errors.customerId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName} - {customer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.customerId && (
                    <p className="text-sm text-red-500 mt-1">{errors.customerId}</p>
                  )}
                </div>

                {/* Property Selection */}
                {selectedCustomer?.properties && selectedCustomer.properties.length > 0 && (
                  <div>
                    <Label htmlFor="property">Property (Optional)</Label>
                    <Select 
                      value={formData.propertyId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, propertyId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No specific property</SelectItem>
                        {selectedCustomer.properties.map((property) => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.name} - {property.address}, {property.city}, {property.state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Partner Attribution */}
                <div>
                  <Label htmlFor="partner">Primary Partner (Optional)</Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Which partner brought this project? This affects revenue attribution.
                  </p>
                  <Select 
                    value={formData.primaryPartnerId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, primaryPartnerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select partner who brought this project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No partner attribution</SelectItem>
                      {partners.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          <div>
                            <div className="font-medium">{partner.companyName}</div>
                            <div className="text-sm text-gray-500">
                              {partner.type.replace('-', ' ')} - {partner.contactName}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Project Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the project scope and requirements..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Details & Timeline</CardTitle>
                <CardDescription>
                  Set up the project timeline and financial information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Financial Information */}
                <div>
                  <Label htmlFor="estimatedValue">Estimated Project Value</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="estimatedValue"
                      type="number"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                      placeholder="0.00"
                      className={`pl-10 ${errors.estimatedValue ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.estimatedValue && (
                    <p className="text-sm text-red-500 mt-1">{errors.estimatedValue}</p>
                  )}
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="projectedFinishDate">Projected Finish Date</Label>
                    <Input
                      id="projectedFinishDate"
                      type="date"
                      value={formData.projectedFinishDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectedFinishDate: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="materialDeliveryDate">Material Delivery Date</Label>
                    <Input
                      id="materialDeliveryDate"
                      type="date"
                      value={formData.materialDeliveryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, materialDeliveryDate: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & Create Project</CardTitle>
                <CardDescription>
                  Review your project details before creating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Overview */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{formData.name}</h3>
                    <Badge variant="outline">
                      {formData.projectType.replace('-', ' ')}
                    </Badge>
                  </div>
                  
                  {formData.description && (
                    <p className="text-sm text-gray-600">{formData.description}</p>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Customer:</span>
                      <span className="ml-2">
                        {selectedCustomer ? 
                          `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 
                          'Not selected'
                        }
                      </span>
                    </div>
                    
                    {selectedPartner && (
                      <div>
                        <span className="font-medium text-gray-700">Primary Partner:</span>
                        <span className="ml-2">{selectedPartner.companyName}</span>
                      </div>
                    )}
                    
                    {formData.estimatedValue && (
                      <div>
                        <span className="font-medium text-gray-700">Budget:</span>
                        <span className="ml-2">
                          ${Number(formData.estimatedValue).toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {formData.projectedFinishDate && (
                      <div>
                        <span className="font-medium text-gray-700">Due Date:</span>
                        <span className="ml-2">
                          {new Date(formData.projectedFinishDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {selectedTemplate && (
                    <div className="pt-2 border-t">
                      <span className="text-sm font-medium text-gray-700">Template:</span>
                      <span className="ml-2 text-sm">{selectedTemplate.name}</span>
                    </div>
                  )}
                </div>

                {/* Warning if no customer */}
                {!selectedCustomer && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          No customer selected
                        </p>
                        <p className="text-sm text-amber-700">
                          You&apos;ll need to add a customer before you can create this project.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={step === 1 ? () => router.push('/projects') : handleBack}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            {step < 3 ? (
              <Button onClick={handleNext} disabled={customers.length === 0 && step === 1}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={loading || !selectedCustomer}
                className="min-w-32"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}