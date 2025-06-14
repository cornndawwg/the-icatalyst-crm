'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft,
  Mail,
  Search,
  Plus,
  Eye,
  Edit,
  Copy,
  FileText,
  Users,
  Building2,
  Compass,
  Sparkles,
  X
} from 'lucide-react'
import { 
  emailTemplates, 
  getTemplatesByCategory, 
  type EmailTemplate 
} from '@/lib/emailTemplates'

export default function EmailTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | EmailTemplate['category']>('all')
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null)
  const router = useRouter()

  const categories = [
    { value: 'all', label: 'All Templates', icon: Mail },
    { value: 'interior-designer', label: 'Interior Designers', icon: Sparkles },
    { value: 'builder', label: 'Builders', icon: Building2 },
    { value: 'architect', label: 'Architects', icon: Compass },
    { value: 'general', label: 'General', icon: FileText },
  ]

  const filteredTemplates = emailTemplates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: EmailTemplate['category']) => {
    switch (category) {
      case 'interior-designer':
        return <Sparkles className="h-4 w-4" />
      case 'builder':
        return <Building2 className="h-4 w-4" />
      case 'architect':
        return <Compass className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: EmailTemplate['category']) => {
    switch (category) {
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

  const handleUseTemplate = (template: EmailTemplate) => {
    // Navigate to campaign creation with template ID
    router.push(`/future-partners/campaigns/new?template=${template.id}`)
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
                <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Pre-built templates for partner outreach campaigns
                </p>
              </div>
            </div>
            <Button onClick={() => router.push('/future-partners/campaigns/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Search and filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category tabs */}
        <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.value} 
                value={category.value}
                className="flex items-center gap-2"
              >
                <category.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Templates grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Subject line preview */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Subject Line</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{template.subject}</p>
                    </div>

                    {/* Preview text */}
                    {template.previewText && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Preview Text</p>
                        <p className="text-sm text-gray-600 italic line-clamp-2">{template.previewText}</p>
                      </div>
                    )}

                    {/* Variables used */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Variables Used</p>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map((variable) => (
                          <Badge key={variable} variant="secondary" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                        {template.variables.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.variables.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setPreviewTemplate(template)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleUseTemplate(template)}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or category filter
                </p>
              </CardContent>
            </Card>
          )}
        </Tabs>
      </main>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{previewTemplate.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{previewTemplate.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPreviewTemplate(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Email preview */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-1">SUBJECT</p>
                  <p className="font-medium">{previewTemplate.subject}</p>
                </div>
                {previewTemplate.previewText && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-1">PREVIEW TEXT</p>
                    <p className="text-sm text-gray-600 italic">{previewTemplate.previewText}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">EMAIL CONTENT</p>
                  <div className="bg-white rounded border p-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm">{previewTemplate.content}</pre>
                  </div>
                </div>
              </div>

              {/* Variables */}
              <div className="mb-6">
                <h3 className="font-medium mb-2">Variables Used</h3>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.variables.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(previewTemplate.content)
                    alert('Template copied to clipboard!')
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Template
                </Button>
                <Button onClick={() => handleUseTemplate(previewTemplate)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Use This Template
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}