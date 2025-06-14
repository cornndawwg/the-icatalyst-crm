'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Mail,
  Users,
  Calendar,
  Clock,
  FileText,
  Variable,
  Eye,
  Send,
  Save,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react'
import { 
  emailVariables,
  getTemplateById,
  processTemplate,
  type EmailTemplate
} from '@/lib/emailTemplates'
import type { FuturePartner } from '@/types'

interface CampaignData {
  name: string
  subject: string
  previewText: string
  content: string
  templateId?: string
  targetTypes: ('interior-designer' | 'builder' | 'architect')[]
  recipients: string[]
  scheduledDate?: string
  scheduledTime?: string
  status: 'draft' | 'scheduled'
}

export default function NewCampaignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  
  const [currentStep, setCurrentStep] = useState(1)
  const [campaignData, setCampaignData] = useState<CampaignData>({
    name: '',
    subject: '',
    previewText: '',
    content: '',
    templateId: templateId || undefined,
    targetTypes: [],
    recipients: [],
    status: 'draft'
  })
  
  const [futurePartners, setFuturePartners] = useState<FuturePartner[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [showVariableHelper, setShowVariableHelper] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [sampleVariables] = useState<Record<string, string>>({
    firstName: 'John',
    lastName: 'Smith',
    companyName: 'Acme Design Studio',
    partnerType: 'Interior Designer',
    location: 'New York, NY',
    'integrator.firstName': 'Your Name',
    'integrator.companyName': 'Your Company',
    'integrator.phone': '(555) 123-4567',
    'integrator.email': 'you@company.com',
    'stats.avgProjectValue': '$15,000'
  })

  useEffect(() => {
    // Load template if provided
    if (templateId) {
      const template = getTemplateById(templateId)
      if (template) {
        setSelectedTemplate(template)
        setCampaignData(prev => ({
          ...prev,
          name: `Campaign: ${template.name}`,
          subject: template.subject,
          previewText: template.previewText || '',
          content: template.content,
          targetTypes: template.category === 'general' ? [] : [template.category]
        }))
      }
    }

    // Load future partners
    // TODO: Replace with actual API call
    const mockPartners: FuturePartner[] = [
      {
        id: 'fp-1',
        name: 'Luxe Interior Design',
        type: 'interior-designer',
        address: '456 Design Ave, City, ST 12345',
        email: 'info@luxeinteriors.com',
        status: 'contacted',
        discoveredDate: '2024-01-10',
        source: 'discovery',
        specialties: [],
        campaignHistory: []
      },
      {
        id: 'fp-2',
        name: 'Premier Custom Builders',
        type: 'builder',
        address: '789 Construction Blvd, City, ST 12345',
        status: 'new',
        discoveredDate: '2024-01-08',
        source: 'discovery',
        specialties: [],
        campaignHistory: []
      }
    ]
    setFuturePartners(mockPartners)
  }, [templateId])

  const steps = [
    { number: 1, title: 'Campaign Details', icon: FileText },
    { number: 2, title: 'Email Content', icon: Mail },
    { number: 3, title: 'Recipients', icon: Users },
    { number: 4, title: 'Schedule', icon: Calendar },
    { number: 5, title: 'Review & Send', icon: Send }
  ]

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('email-content') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = textarea.value
      const before = text.substring(0, start)
      const after = text.substring(end)
      
      setCampaignData(prev => ({
        ...prev,
        content: before + `{{${variable}}}` + after
      }))
      
      // Reset cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + variable.length + 4
        textarea.focus()
      }, 0)
    }
  }

  const getFilteredPartners = () => {
    if (campaignData.targetTypes.length === 0) return futurePartners
    return futurePartners.filter(partner => 
      campaignData.targetTypes.includes(partner.type)
    )
  }

  const handleSaveDraft = async () => {
    // TODO: Save campaign as draft
    alert('Campaign saved as draft!')
    router.push('/future-partners')
  }

  const handleScheduleCampaign = async () => {
    // TODO: Schedule campaign
    alert('Campaign scheduled successfully!')
    router.push('/future-partners')
  }

  const handleSendNow = async () => {
    if (confirm('Are you sure you want to send this campaign now?')) {
      // TODO: Send campaign immediately
      alert('Campaign sent successfully!')
      router.push('/future-partners')
    }
  }

  const processedContent = processTemplate(campaignData.content, sampleVariables)
  const processedSubject = processTemplate(campaignData.subject, sampleVariables)

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
                <h1 className="text-2xl font-bold text-gray-900">Create Email Campaign</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedTemplate ? `Using template: ${selectedTemplate.name}` : 'Create a new campaign from scratch'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div className="flex items-center">
                <div className={`
                  rounded-full h-10 w-10 flex items-center justify-center border-2
                  ${currentStep >= step.number 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-500'}
                `}>
                  <step.icon className="h-5 w-5" />
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:inline
                  ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}
                `}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Campaign Details */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  Set up the basic information for your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    placeholder="e.g., Q1 Partnership Outreach"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Internal name to identify this campaign
                  </p>
                </div>

                <div>
                  <Label>Target Partner Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['interior-designer', 'builder', 'architect'].map((type) => (
                      <Button
                        key={type}
                        variant={campaignData.targetTypes.includes(type as ('interior-designer' | 'builder' | 'architect')) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setCampaignData(prev => ({
                            ...prev,
                            targetTypes: prev.targetTypes.includes(type as ('interior-designer' | 'builder' | 'architect'))
                              ? prev.targetTypes.filter(t => t !== type)
                              : [...prev.targetTypes, type as ('interior-designer' | 'builder' | 'architect')]
                          }))
                        }}
                      >
                        {type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Select which partner types to target with this campaign
                  </p>
                </div>

                {selectedTemplate && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Using Template</p>
                        <p className="text-sm text-blue-700 mt-1">
                          You&apos;re using the &quot;{selectedTemplate.name}&quot; template. 
                          You can customize the content in the next step.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Email Content */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Email Content</CardTitle>
                      <CardDescription>
                        Customize your email message
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowVariableHelper(!showVariableHelper)}
                      >
                        <Variable className="mr-2 h-4 w-4" />
                        Variables
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        {previewMode ? 'Edit' : 'Preview'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {previewMode ? (
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-1">SUBJECT</p>
                        <p className="font-medium">{processedSubject}</p>
                      </div>
                      {campaignData.previewText && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 mb-1">PREVIEW TEXT</p>
                          <p className="text-sm text-gray-600 italic">
                            {processTemplate(campaignData.previewText, sampleVariables)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">EMAIL CONTENT</p>
                        <div className="bg-white rounded border p-4">
                          <pre className="whitespace-pre-wrap font-sans text-sm">{processedContent}</pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="subject">Subject Line</Label>
                        <Input
                          id="subject"
                          placeholder="e.g., Partnership Opportunity with {{companyName}}"
                          value={campaignData.subject}
                          onChange={(e) => setCampaignData(prev => ({ ...prev, subject: e.target.value }))}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="preview-text">Preview Text (Optional)</Label>
                        <Input
                          id="preview-text"
                          placeholder="Text that appears in email preview"
                          value={campaignData.previewText}
                          onChange={(e) => setCampaignData(prev => ({ ...prev, previewText: e.target.value }))}
                          className="mt-1"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          This appears after the subject in most email clients
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="email-content">Email Body</Label>
                        <Textarea
                          id="email-content"
                          placeholder="Write your email content here..."
                          value={campaignData.content}
                          onChange={(e) => setCampaignData(prev => ({ ...prev, content: e.target.value }))}
                          className="mt-1 min-h-[400px] font-mono text-sm"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Variable Helper */}
              {showVariableHelper && !previewMode && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Available Variables</CardTitle>
                    <CardDescription>
                      Click any variable to insert it into your email
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['partner', 'integrator', 'stats'].map((category) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">
                            {category} Variables
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {emailVariables
                              .filter(v => v.category === category)
                              .map((variable) => (
                                <Button
                                  key={variable.key}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => insertVariable(variable.key)}
                                  className="text-xs"
                                >
                                  <Variable className="mr-1 h-3 w-3" />
                                  {`{{${variable.key}}}`}
                                </Button>
                              ))
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Step 3: Recipients */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Recipients</CardTitle>
                <CardDescription>
                  Choose which future partners will receive this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600">
                      {getFilteredPartners().length} partners match your criteria
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allIds = getFilteredPartners().map(p => p.id)
                        setCampaignData(prev => ({
                          ...prev,
                          recipients: prev.recipients.length === allIds.length ? [] : allIds
                        }))
                      }}
                    >
                      {campaignData.recipients.length === getFilteredPartners().length 
                        ? 'Deselect All' 
                        : 'Select All'}
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {getFilteredPartners().map((partner) => (
                      <div
                        key={partner.id}
                        className={`
                          border rounded-lg p-4 cursor-pointer transition-colors
                          ${campaignData.recipients.includes(partner.id) 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'}
                        `}
                        onClick={() => {
                          setCampaignData(prev => ({
                            ...prev,
                            recipients: prev.recipients.includes(partner.id)
                              ? prev.recipients.filter(id => id !== partner.id)
                              : [...prev.recipients, partner.id]
                          }))
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{partner.name}</p>
                            <p className="text-sm text-gray-600">
                              {partner.email || 'No email address'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {partner.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </Badge>
                            <Badge variant={partner.status === 'new' ? 'default' : 'secondary'}>
                              {partner.status}
                            </Badge>
                          </div>
                        </div>
                        {partner.campaignHistory.length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            Last campaign: {partner.campaignHistory.length} sent
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {getFilteredPartners().length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        No partners match your selected criteria
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Schedule */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule Campaign</CardTitle>
                <CardDescription>
                  Choose when to send your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="schedule"
                      value="now"
                      checked={!campaignData.scheduledDate}
                      onChange={() => setCampaignData(prev => ({ 
                        ...prev, 
                        scheduledDate: undefined,
                        scheduledTime: undefined 
                      }))}
                      className="h-4 w-4"
                    />
                    <div>
                      <p className="font-medium">Send Now</p>
                      <p className="text-sm text-gray-600">
                        Campaign will be sent immediately
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="schedule"
                      value="later"
                      checked={!!campaignData.scheduledDate}
                      onChange={() => setCampaignData(prev => ({ 
                        ...prev, 
                        scheduledDate: new Date().toISOString().split('T')[0],
                        scheduledTime: '09:00'
                      }))}
                      className="h-4 w-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium">Schedule for Later</p>
                      <p className="text-sm text-gray-600">
                        Choose a specific date and time
                      </p>
                    </div>
                  </label>
                </div>

                {campaignData.scheduledDate && (
                  <div className="ml-7 space-y-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="scheduled-date">Date</Label>
                      <Input
                        id="scheduled-date"
                        type="date"
                        value={campaignData.scheduledDate}
                        onChange={(e) => setCampaignData(prev => ({ 
                          ...prev, 
                          scheduledDate: e.target.value 
                        }))}
                        className="mt-1"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduled-time">Time</Label>
                      <Input
                        id="scheduled-time"
                        type="time"
                        value={campaignData.scheduledTime}
                        onChange={(e) => setCampaignData(prev => ({ 
                          ...prev, 
                          scheduledTime: e.target.value 
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Times are in your local timezone
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Review & Send */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Campaign</CardTitle>
                  <CardDescription>
                    Confirm all details before sending
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Campaign Details</h3>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Campaign Name:</dt>
                        <dd className="font-medium">{campaignData.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Target Types:</dt>
                        <dd className="font-medium">
                          {campaignData.targetTypes.length > 0 
                            ? campaignData.targetTypes.map(t => 
                                t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                              ).join(', ')
                            : 'All'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Recipients:</dt>
                        <dd className="font-medium">{campaignData.recipients.length} partners</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Schedule:</dt>
                        <dd className="font-medium">
                          {campaignData.scheduledDate 
                            ? `${campaignData.scheduledDate} at ${campaignData.scheduledTime}`
                            : 'Send immediately'}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Email Preview</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm">
                      <p className="font-medium mb-2">{processedSubject}</p>
                      <p className="text-gray-600 line-clamp-3">{processedContent}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-900">Before sending:</p>
                        <ul className="mt-1 text-yellow-700 space-y-1">
                          <li>• Double-check all variable placeholders are correct</li>
                          <li>• Verify recipient list includes the right partners</li>
                          <li>• Confirm the schedule timing is appropriate</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                {campaignData.scheduledDate ? (
                  <Button 
                    onClick={handleScheduleCampaign}
                    className="flex-1"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Campaign
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSendNow}
                    className="flex-1"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Campaign Now
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            {currentStep < steps.length ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}