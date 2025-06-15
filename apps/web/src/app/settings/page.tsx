'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft,
  Building2,
  Mail,
  Calendar,
  CreditCard,
  Users,
  Shield,
  Bell,
  Download,
  Settings,
  Upload,
  Check,
  Globe,
  Eye,
  EyeOff,
  TestTube
} from 'lucide-react'
import { settingsApi } from '@/lib/api'

export default function SettingsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('company')
  const [showPassword, setShowPassword] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load settings from backend
  useEffect(() => {
    if (!mounted) return

    const loadSettings = async () => {
      try {
        setLoading(true)
        
        // Check if user is authenticated
        const token = localStorage.getItem('auth-token')
        if (!token) {
          router.push('/login')
          return
        }
        
        const [orgData, userData] = await Promise.all([
          settingsApi.getOrganization(),
          settingsApi.getUser()
        ])
        
        // Update form states with loaded data
        setCompanyInfo({
          name: orgData.name || '',
          email: orgData.email || '',
          phone: orgData.phone || '',
          website: orgData.website || '',
          address: orgData.address || '',
          city: orgData.city || '',
          state: orgData.state || '',
          zipCode: orgData.zipCode || '',
          logo: null
        })
        
        setEmailConfig({
          provider: orgData.emailProvider || 'mailgun',
          smtpHost: orgData.smtpHost || '',
          smtpPort: orgData.smtpPort?.toString() || '587',
          smtpUsername: orgData.smtpUsername || '',
          smtpPassword: '',
          fromEmail: orgData.fromEmail || 'noreply@company.com',
          fromName: orgData.fromName || 'Your Company',
          encryption: orgData.smtpEncryption || 'tls'
        })
        
        setCalendarIntegration({
          googleConnected: userData.googleCalendarConnected || false,
          outlookConnected: userData.outlookCalendarConnected || false,
          defaultCalendar: 'primary',
          syncEnabled: userData.calendarSyncEnabled || false,
          reminderMinutes: userData.defaultReminderMinutes || 15
        })
        
        setSecuritySettings({
          twoFactorEnabled: userData.twoFactorEnabled || false,
          passwordPolicy: 'medium',
          sessionTimeout: '8',
          loginNotifications: true
        })
        
        setNotificationPrefs({
          emailNotifications: userData.emailNotifications || true,
          smsNotifications: userData.smsNotifications || false,
          browserNotifications: userData.browserNotifications || true,
          weeklyReports: userData.weeklyReports || true,
          partnerUpdates: userData.partnerUpdates || true,
          campaignResults: userData.campaignResults || true
        })
        
      } catch (error: unknown) {
        console.error('Failed to load settings:', error)
        
        // Handle authentication errors
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { status: number } }
          if (axiosError.response.status === 401) {
            localStorage.removeItem('auth-token')
            router.push('/login')
            return
          }
        }
        
        // For other errors, show user-friendly message
        alert('Failed to load settings. Please try refreshing the page.')
      } finally {
        setLoading(false)
      }
    }
    
    loadSettings()
  }, [mounted, router])
  
  // Derived company info for form
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    logo: null as File | null
  })

  const [emailConfig, setEmailConfig] = useState({
    provider: 'mailgun', // mailgun, smtp, gmail, outlook
    smtpHost: '',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@company.com',
    fromName: 'Your Company',
    encryption: 'tls'
  })

  const [calendarIntegration, setCalendarIntegration] = useState({
    googleConnected: false,
    outlookConnected: false,
    defaultCalendar: 'primary',
    syncEnabled: true,
    reminderMinutes: 15
  })

  const [billingInfo] = useState({
    plan: 'professional',
    billingCycle: 'monthly',
    nextBilling: '2024-02-15',
    paymentMethod: 'card-4567'
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    passwordPolicy: 'medium',
    sessionTimeout: '8',
    loginNotifications: true
  })

  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    smsNotifications: false,
    browserNotifications: true,
    weeklyReports: true,
    partnerUpdates: true,
    campaignResults: true
  })

  const handleTestEmail = async () => {
    setTestingEmail(true)
    try {
      await settingsApi.testEmail()
      alert('Test email sent successfully!')
    } catch (error) {
      console.error('Test email failed:', error)
      alert('Failed to send test email. Check your settings.')
    } finally {
      setTestingEmail(false)
    }
  }

  const handleConnectGoogle = async () => {
    try {
      const result = await settingsApi.connectGoogleCalendar()
      if (result.authUrl) {
        window.open(result.authUrl, '_blank')
      }
      alert('Google Calendar connection initiated. Complete the authorization in the new window.')
    } catch (error) {
      console.error('Google Calendar connection failed:', error)
      alert('Failed to connect Google Calendar.')
    }
  }

  const handleConnectOutlook = async () => {
    try {
      const result = await settingsApi.connectOutlookCalendar()
      if (result.authUrl) {
        window.open(result.authUrl, '_blank')
      }
      alert('Outlook Calendar connection initiated. Complete the authorization in the new window.')
    } catch (error) {
      console.error('Outlook Calendar connection failed:', error)
      alert('Failed to connect Outlook Calendar.')
    }
  }

  const handleSaveSettings = async (section: string) => {
    try {
      setSaving(true)
      
      switch (section) {
        case 'company':
          await settingsApi.updateOrganization({
            name: companyInfo.name,
            email: companyInfo.email,
            phone: companyInfo.phone,
            website: companyInfo.website,
            address: companyInfo.address,
            city: companyInfo.city,
            state: companyInfo.state,
            zipCode: companyInfo.zipCode
          })
          break
          
        case 'email':
          await settingsApi.updateOrganization({
            emailProvider: emailConfig.provider,
            smtpHost: emailConfig.smtpHost,
            smtpPort: emailConfig.smtpPort,
            smtpUsername: emailConfig.smtpUsername,
            ...(emailConfig.smtpPassword && { smtpPassword: emailConfig.smtpPassword }),
            smtpEncryption: emailConfig.encryption,
            fromEmail: emailConfig.fromEmail,
            fromName: emailConfig.fromName
          })
          break
          
        case 'calendar':
          await settingsApi.updateUser({
            calendarSyncEnabled: calendarIntegration.syncEnabled,
            defaultReminderMinutes: calendarIntegration.reminderMinutes
          })
          break
          
        case 'security':
          await settingsApi.updateUser({
            twoFactorEnabled: securitySettings.twoFactorEnabled
          })
          break
          
        case 'notifications':
          await settingsApi.updateUser({
            emailNotifications: notificationPrefs.emailNotifications,
            smsNotifications: notificationPrefs.smsNotifications,
            browserNotifications: notificationPrefs.browserNotifications,
            weeklyReports: notificationPrefs.weeklyReports,
            partnerUpdates: notificationPrefs.partnerUpdates,
            campaignResults: notificationPrefs.campaignResults
          })
          break
      }
      
      alert(`${section} settings saved successfully!`)
    } catch (error) {
      console.error(`Failed to save ${section} settings:`, error)
      alert(`Failed to save ${section} settings.`)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'email', label: 'Email Setup', icon: Mail },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Export', icon: Download }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {!mounted || loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      ) : (
        <>
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
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage your account, integrations, and preferences
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

      {/* Main content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-6">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2 px-2"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Company Profile Tab */}
            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Update your business details and branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input
                        id="company-name"
                        value={companyInfo.name}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-email">Email Address</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={companyInfo.email}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-phone">Phone Number</Label>
                      <Input
                        id="company-phone"
                        value={companyInfo.phone}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-website">Website</Label>
                      <Input
                        id="company-website"
                        value={companyInfo.website}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="company-address">Street Address</Label>
                    <Input
                      id="company-address"
                      value={companyInfo.address}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="company-city">City</Label>
                      <Input
                        id="company-city"
                        value={companyInfo.city}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-state">State</Label>
                      <Input
                        id="company-state"
                        value={companyInfo.state}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="company-zip">ZIP Code</Label>
                      <Input
                        id="company-zip"
                        value={companyInfo.zipCode}
                        onChange={(e) => setCompanyInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Company Logo</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                        {companyInfo.logo ? (
                          <Image 
                            src={URL.createObjectURL(companyInfo.logo)} 
                            alt="Logo" 
                            className="h-full w-full object-cover rounded-lg"
                            width={80}
                            height={80}
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <Button variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Logo
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG up to 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleSaveSettings('company')}
                      disabled={saving || loading}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Email Configuration Tab */}
            <TabsContent value="email" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>
                    Setup your own SMTP server or use our managed service
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Email Provider</Label>
                    <Select value={emailConfig.provider} onValueChange={(value) => 
                      setEmailConfig(prev => ({ ...prev, provider: value }))
                    }>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mailgun">Mailgun (Managed)</SelectItem>
                        <SelectItem value="smtp">Custom SMTP</SelectItem>
                        <SelectItem value="gmail">Gmail</SelectItem>
                        <SelectItem value="outlook">Outlook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {emailConfig.provider === 'smtp' && (
                    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium">SMTP Server Configuration</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="smtp-host">SMTP Host</Label>
                          <Input
                            id="smtp-host"
                            placeholder="smtp.gmail.com"
                            value={emailConfig.smtpHost}
                            onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtp-port">Port</Label>
                          <Input
                            id="smtp-port"
                            placeholder="587"
                            value={emailConfig.smtpPort}
                            onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPort: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtp-username">Username</Label>
                          <Input
                            id="smtp-username"
                            value={emailConfig.smtpUsername}
                            onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpUsername: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="smtp-password">Password</Label>
                          <div className="relative">
                            <Input
                              id="smtp-password"
                              type={showPassword ? 'text' : 'password'}
                              value={emailConfig.smtpPassword}
                              onChange={(e) => setEmailConfig(prev => ({ ...prev, smtpPassword: e.target.value }))}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Encryption</Label>
                        <Select value={emailConfig.encryption} onValueChange={(value) => 
                          setEmailConfig(prev => ({ ...prev, encryption: value }))
                        }>
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tls">TLS</SelectItem>
                            <SelectItem value="ssl">SSL</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="from-email">From Email</Label>
                      <Input
                        id="from-email"
                        type="email"
                        value={emailConfig.fromEmail}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, fromEmail: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="from-name">From Name</Label>
                      <Input
                        id="from-name"
                        value={emailConfig.fromName}
                        onChange={(e) => setEmailConfig(prev => ({ ...prev, fromName: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={handleTestEmail}
                      disabled={testingEmail}
                    >
                      {testingEmail ? (
                        <>
                          <TestTube className="mr-2 h-4 w-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="mr-2 h-4 w-4" />
                          Send Test Email
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={() => handleSaveSettings('email')}
                      disabled={saving || loading}
                    >
                      {saving ? 'Saving...' : 'Save Email Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Calendar Integration Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Integration</CardTitle>
                  <CardDescription>
                    Connect your calendar to sync appointments and meetings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Globe className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Google Calendar</h4>
                          <p className="text-sm text-gray-600">
                            {calendarIntegration.googleConnected 
                              ? 'Connected - syncing events' 
                              : 'Connect to sync your Google Calendar'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {calendarIntegration.googleConnected && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="mr-1 h-3 w-3" />
                            Connected
                          </Badge>
                        )}
                        <Button
                          variant={calendarIntegration.googleConnected ? "outline" : "default"}
                          size="sm"
                          onClick={handleConnectGoogle}
                        >
                          {calendarIntegration.googleConnected ? 'Disconnect' : 'Connect'}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Outlook Calendar</h4>
                          <p className="text-sm text-gray-600">
                            {calendarIntegration.outlookConnected 
                              ? 'Connected - syncing events' 
                              : 'Connect to sync your Outlook Calendar'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {calendarIntegration.outlookConnected && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="mr-1 h-3 w-3" />
                            Connected
                          </Badge>
                        )}
                        <Button
                          variant={calendarIntegration.outlookConnected ? "outline" : "default"}
                          size="sm"
                          onClick={handleConnectOutlook}
                        >
                          {calendarIntegration.outlookConnected ? 'Disconnect' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Sync Settings</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sync-enabled">Enable Calendar Sync</Label>
                        <p className="text-sm text-gray-600">Automatically sync CRM events with your calendar</p>
                      </div>
                      <Switch 
                        id="sync-enabled"
                        checked={calendarIntegration.syncEnabled}
                        onCheckedChange={(checked) => 
                          setCalendarIntegration(prev => ({ ...prev, syncEnabled: checked }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="reminder-minutes">Default Reminder (minutes)</Label>
                      <Select 
                        value={calendarIntegration.reminderMinutes.toString()} 
                        onValueChange={(value) => 
                          setCalendarIntegration(prev => ({ ...prev, reminderMinutes: parseInt(value) }))
                        }
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 minutes</SelectItem>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleSaveSettings('calendar')}
                      disabled={saving || loading}
                    >
                      {saving ? 'Saving...' : 'Save Calendar Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Billing & Subscription</CardTitle>
                  <CardDescription>
                    Manage your subscription and payment methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-blue-900">Professional Plan</h4>
                        <p className="text-sm text-blue-700">
                          Billed monthly • Next billing: {billingInfo.nextBilling}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-900">$99</p>
                        <p className="text-sm text-blue-700">per month</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Payment Method</h4>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-6 w-6 text-gray-400" />
                          <div>
                            <p className="font-medium">•••• •••• •••• 4567</p>
                            <p className="text-sm text-gray-600">Expires 12/25</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Billing History</h4>
                    <div className="space-y-2">
                      {[
                        { date: '2024-01-15', amount: '$99.00', status: 'Paid' },
                        { date: '2023-12-15', amount: '$99.00', status: 'Paid' },
                        { date: '2023-11-15', amount: '$99.00', status: 'Paid' }
                      ].map((invoice, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b">
                          <div>
                            <p className="font-medium">{invoice.date}</p>
                            <p className="text-sm text-gray-600">Professional Plan</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{invoice.amount}</p>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline">
                      Change Plan
                    </Button>
                    <Button variant="outline">
                      Download Invoices
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Add other tabs here - Team, Security, Notifications, Data */}
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Management</CardTitle>
                  <CardDescription>
                    Manage team members and their access levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Team Management</h3>
                    <p className="text-gray-600">
                      Add team members, assign roles, and manage permissions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Configure security features and access controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                      </div>
                      <Switch 
                        checked={securitySettings.twoFactorEnabled}
                        onCheckedChange={(checked) => 
                          setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Login Notifications</Label>
                        <p className="text-sm text-gray-600">Get notified when someone logs into your account</p>
                      </div>
                      <Switch 
                        checked={securitySettings.loginNotifications}
                        onCheckedChange={(checked) => 
                          setSecuritySettings(prev => ({ ...prev, loginNotifications: checked }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleSaveSettings('security')}
                      disabled={saving || loading}
                    >
                      {saving ? 'Saving...' : 'Save Security Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about important events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-gray-600">Receive updates via email</p>
                      </div>
                      <Switch 
                        checked={notificationPrefs.emailNotifications}
                        onCheckedChange={(checked) => 
                          setNotificationPrefs(prev => ({ ...prev, emailNotifications: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Weekly Reports</Label>
                        <p className="text-sm text-gray-600">Get weekly summary of your activity</p>
                      </div>
                      <Switch 
                        checked={notificationPrefs.weeklyReports}
                        onCheckedChange={(checked) => 
                          setNotificationPrefs(prev => ({ ...prev, weeklyReports: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Partner Updates</Label>
                        <p className="text-sm text-gray-600">Notifications about partner interactions</p>
                      </div>
                      <Switch 
                        checked={notificationPrefs.partnerUpdates}
                        onCheckedChange={(checked) => 
                          setNotificationPrefs(prev => ({ ...prev, partnerUpdates: checked }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleSaveSettings('notifications')}
                      disabled={saving || loading}
                    >
                      {saving ? 'Saving...' : 'Save Notification Settings'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data & Export Tab */}
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data & Export</CardTitle>
                  <CardDescription>
                    Export your data and manage backups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-20 flex-col">
                        <Download className="h-6 w-6 mb-2" />
                        Export Partners
                      </Button>
                      <Button variant="outline" className="h-20 flex-col">
                        <Download className="h-6 w-6 mb-2" />
                        Export Campaigns
                      </Button>
                      <Button variant="outline" className="h-20 flex-col">
                        <Download className="h-6 w-6 mb-2" />
                        Export Projects
                      </Button>
                      <Button variant="outline" className="h-20 flex-col">
                        <Download className="h-6 w-6 mb-2" />
                        Full Data Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        </main>
        </>
      )}
    </div>
  )
}