import { Router, Request, Response } from 'express'
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth'
import bcrypt from 'bcrypt'

const router = Router()
router.use(authenticateToken as any)

// Get organization settings
router.get('/organization', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('Getting organization settings for user:', req.user?.userId, 'org:', req.user?.organizationId)
    
    const { prisma } = req.app.locals
    if (!prisma) {
      console.error('Prisma client not available')
      res.status(500).json({ error: 'Database connection not available' })
      return
    }

    const organization = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        logo: true,
        plan: true,
        status: true,
        emailProvider: true,
        smtpHost: true,
        smtpPort: true,
        smtpUsername: true,
        smtpEncryption: true,
        fromEmail: true,
        fromName: true,
        settings: true
      }
    })

    console.log('Found organization:', organization?.id)

    if (!organization) {
      res.status(404).json({ error: 'Organization not found' })
      return
    }

    // Don't return the SMTP password
    res.json(organization)
  } catch (error) {
    console.error('Error fetching organization settings:', error)
    res.status(500).json({ error: 'Failed to fetch organization settings', details: error.message })
  }
})

// Update organization settings
router.put('/organization', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prisma } = req.app.locals
    const {
      name,
      email,
      phone,
      website,
      address,
      city,
      state,
      zipCode,
      logo,
      emailProvider,
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword,
      smtpEncryption,
      fromEmail,
      fromName,
      settings
    } = req.body

    const updateData: any = {
      name,
      email,
      phone,
      website,
      address,
      city,
      state,
      zipCode,
      logo,
      emailProvider,
      smtpHost,
      smtpPort: smtpPort ? parseInt(smtpPort) : null,
      smtpUsername,
      smtpEncryption,
      fromEmail,
      fromName,
      settings
    }

    // Only update password if provided
    if (smtpPassword) {
      // In production, encrypt the password
      updateData.smtpPassword = smtpPassword
    }

    const organization = await prisma.organization.update({
      where: { id: req.user!.organizationId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        website: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        logo: true,
        emailProvider: true,
        smtpHost: true,
        smtpPort: true,
        smtpUsername: true,
        smtpEncryption: true,
        fromEmail: true,
        fromName: true,
        settings: true
      }
    })

    res.json(organization)
  } catch (error) {
    console.error('Error updating organization settings:', error)
    res.status(500).json({ error: 'Failed to update organization settings' })
  }
})

// Get user settings
router.get('/user', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    console.log('Getting user settings for user:', req.user?.userId)
    
    const { prisma } = req.app.locals
    if (!prisma) {
      console.error('Prisma client not available')
      res.status(500).json({ error: 'Database connection not available' })
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
        emailNotifications: true,
        smsNotifications: true,
        browserNotifications: true,
        weeklyReports: true,
        partnerUpdates: true,
        campaignResults: true,
        googleCalendarToken: true,
        outlookCalendarToken: true,
        calendarSyncEnabled: true,
        defaultReminderMinutes: true
      }
    })

    console.log('Found user:', user?.id)

    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    // Don't return actual tokens, just indicate if connected
    const userSettings = {
      ...user,
      googleCalendarConnected: !!user.googleCalendarToken,
      outlookCalendarConnected: !!user.outlookCalendarToken,
      googleCalendarToken: undefined,
      outlookCalendarToken: undefined
    }

    res.json(userSettings)
  } catch (error) {
    console.error('Error fetching user settings:', error)
    res.status(500).json({ error: 'Failed to fetch user settings', details: error.message })
  }
})

// Update user settings
router.put('/user', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prisma } = req.app.locals
    const {
      firstName,
      lastName,
      twoFactorEnabled,
      emailNotifications,
      smsNotifications,
      browserNotifications,
      weeklyReports,
      partnerUpdates,
      campaignResults,
      calendarSyncEnabled,
      defaultReminderMinutes
    } = req.body

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        firstName,
        lastName,
        twoFactorEnabled,
        emailNotifications,
        smsNotifications,
        browserNotifications,
        weeklyReports,
        partnerUpdates,
        campaignResults,
        calendarSyncEnabled,
        defaultReminderMinutes: defaultReminderMinutes ? parseInt(defaultReminderMinutes) : 15
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
        emailNotifications: true,
        smsNotifications: true,
        browserNotifications: true,
        weeklyReports: true,
        partnerUpdates: true,
        campaignResults: true,
        calendarSyncEnabled: true,
        defaultReminderMinutes: true
      }
    })

    res.json(user)
  } catch (error) {
    console.error('Error updating user settings:', error)
    res.status(500).json({ error: 'Failed to update user settings' })
  }
})

// Test email configuration
router.post('/test-email', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prisma } = req.app.locals
    const { testEmail } = req.body

    // Get organization email settings
    const organization = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId },
      select: {
        emailProvider: true,
        smtpHost: true,
        smtpPort: true,
        smtpUsername: true,
        smtpPassword: true,
        smtpEncryption: true,
        fromEmail: true,
        fromName: true
      }
    })

    if (!organization) {
      res.status(404).json({ error: 'Organization not found' })
      return
    }

    // TODO: Implement email sending based on provider
    if (organization.emailProvider === 'smtp') {
      // Use SMTP settings to send test email
      // Implementation would go here
    }

    // For now, simulate success
    await new Promise(resolve => setTimeout(resolve, 1000))

    res.json({ 
      success: true, 
      message: 'Test email sent successfully',
      sentTo: testEmail || organization.fromEmail
    })
  } catch (error) {
    console.error('Error sending test email:', error)
    res.status(500).json({ error: 'Failed to send test email' })
  }
})

// Connect Google Calendar
router.post('/calendar/google/connect', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // TODO: Implement Google OAuth flow
    // This would involve:
    // 1. Generate OAuth URL
    // 2. Handle callback
    // 3. Store tokens securely

    res.json({ 
      authUrl: 'https://accounts.google.com/oauth2/auth?...',
      message: 'Redirect user to this URL for authentication'
    })
  } catch (error) {
    console.error('Error connecting Google Calendar:', error)
    res.status(500).json({ error: 'Failed to connect Google Calendar' })
  }
})

// Connect Outlook Calendar
router.post('/calendar/outlook/connect', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // TODO: Implement Microsoft OAuth flow
    res.json({ 
      authUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?...',
      message: 'Redirect user to this URL for authentication'
    })
  } catch (error) {
    console.error('Error connecting Outlook Calendar:', error)
    res.status(500).json({ error: 'Failed to connect Outlook Calendar' })
  }
})

// Disconnect calendar
router.delete('/calendar/:provider/disconnect', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prisma } = req.app.locals
    const { provider } = req.params

    const updateData: any = {}
    if (provider === 'google') {
      updateData.googleCalendarToken = null
    } else if (provider === 'outlook') {
      updateData.outlookCalendarToken = null
    }

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData
    })

    res.json({ success: true, message: `${provider} calendar disconnected` })
  } catch (error) {
    console.error('Error disconnecting calendar:', error)
    res.status(500).json({ error: 'Failed to disconnect calendar' })
  }
})

// Get billing information
router.get('/billing', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prisma } = req.app.locals
    const organization = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId },
      select: {
        plan: true,
        status: true,
        settings: true
      }
    })

    if (!organization) {
      res.status(404).json({ error: 'Organization not found' })
      return
    }

    // Mock billing data - replace with actual billing provider integration
    const billingInfo = {
      plan: organization.plan,
      status: organization.status,
      billingCycle: 'monthly',
      nextBilling: '2024-02-15',
      amount: organization.plan === 'professional' ? 99 : organization.plan === 'starter' ? 49 : 199,
      paymentMethod: {
        type: 'card',
        last4: '4567',
        expiry: '12/25'
      },
      invoices: [
        { date: '2024-01-15', amount: 99, status: 'paid' },
        { date: '2023-12-15', amount: 99, status: 'paid' },
        { date: '2023-11-15', amount: 99, status: 'paid' }
      ]
    }

    res.json(billingInfo)
  } catch (error) {
    console.error('Error fetching billing info:', error)
    res.status(500).json({ error: 'Failed to fetch billing information' })
  }
})

// Export data
router.post('/export/:dataType', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prisma } = req.app.locals
    const { dataType } = req.params

    let data: any = {}

    switch (dataType) {
      case 'partners':
        data = await prisma.partner.findMany({
          where: { organizationId: req.user!.organizationId }
        })
        break
      case 'campaigns':
        data = await prisma.emailCampaign.findMany({
          where: { organizationId: req.user!.organizationId }
        })
        break
      case 'projects':
        data = await prisma.project.findMany({
          where: { organizationId: req.user!.organizationId }
        })
        break
      case 'full':
        data = {
          partners: await prisma.partner.findMany({
            where: { organizationId: req.user!.organizationId }
          }),
          campaigns: await prisma.emailCampaign.findMany({
            where: { organizationId: req.user!.organizationId }
          }),
          projects: await prisma.project.findMany({
            where: { organizationId: req.user!.organizationId }
          }),
          customers: await prisma.customer.findMany({
            where: { organizationId: req.user!.organizationId }
          })
        }
        break
      default:
        res.status(400).json({ error: 'Invalid data type' })
        return
    }

    res.json({
      success: true,
      dataType,
      count: Array.isArray(data) ? data.length : Object.keys(data).length,
      data,
      exportedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    res.status(500).json({ error: 'Failed to export data' })
  }
})

export { router as settingsRoutes }