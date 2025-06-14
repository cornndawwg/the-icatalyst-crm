import { Router, Request, Response } from 'express'
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth'
import Mailgun from 'mailgun.js'
import FormData from 'form-data'

const router = Router()
router.use(authenticateToken as any)

// Initialize Mailgun
const mailgun = new Mailgun(FormData)
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!
})

// Send test email
router.post('/test', async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, subject = 'iCatalyst CRM Test Email' } = req.body
    
    const messageData = {
      from: process.env.FROM_EMAIL!,
      to,
      subject,
      html: `
        <h2>🚀 iCatalyst CRM Test Email</h2>
        <p>Congratulations! Your email integration is working perfectly.</p>
        <p>This test email confirms that:</p>
        <ul>
          <li>✅ Mailgun API connection is active</li>
          <li>✅ Email routing is configured</li>
          <li>✅ Your CRM is ready to send partner outreach campaigns</li>
        </ul>
        <p><strong>Ready to build those partnerships? Let's go! 💪</strong></p>
      `
    }
    
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN!, messageData)
    
    res.json({ 
      success: true, 
      messageId: result.id,
      message: 'Test email sent successfully'
    })
  } catch (error) {
    console.error('Email send error:', error)
    res.status(500).json({ error: 'Failed to send email' })
  }
})

// Get all email campaigns
router.get('/campaigns', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prisma } = req.app.locals
    const campaigns = await prisma.emailCampaign.findMany({
      where: { organizationId: req.user!.organizationId },
      orderBy: { createdAt: 'desc' }
    })
    res.json(campaigns)
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    res.status(500).json({ error: 'Failed to fetch campaigns' })
  }
})

// Get single campaign
router.get('/campaigns/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prisma } = req.app.locals
    const campaign = await prisma.emailCampaign.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId
      }
    })
    
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' })
      return
    }
    
    res.json(campaign)
  } catch (error) {
    console.error('Error fetching campaign:', error)
    res.status(500).json({ error: 'Failed to fetch campaign' })
  }
})

// Create new campaign
router.post('/campaigns', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prisma } = req.app.locals
    const {
      name,
      subject,
      content,
      type = 'partner-outreach',
      targetAudience,
      status = 'draft',
      scheduledFor
    } = req.body

    const campaign = await prisma.emailCampaign.create({
      data: {
        organizationId: req.user!.organizationId,
        name,
        subject,
        content,
        type,
        targetAudience,
        status,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null
      }
    })

    res.json(campaign)
  } catch (error) {
    console.error('Error creating campaign:', error)
    res.status(500).json({ error: 'Failed to create campaign' })
  }
})

// Update campaign
router.put('/campaigns/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prisma } = req.app.locals
    const campaign = await prisma.emailCampaign.update({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId
      },
      data: req.body
    })
    res.json(campaign)
  } catch (error) {
    console.error('Error updating campaign:', error)
    res.status(500).json({ error: 'Failed to update campaign' })
  }
})

// Send campaign
router.post('/campaigns/:id/send', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { prisma } = req.app.locals
    const { recipients } = req.body // Array of partner IDs
    
    const campaign = await prisma.emailCampaign.findFirst({
      where: {
        id: req.params.id,
        organizationId: req.user!.organizationId
      }
    })
    
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' })
      return
    }
    
    // Get partners
    const partners = await prisma.partner.findMany({
      where: {
        id: { in: recipients },
        organizationId: req.user!.organizationId
      }
    })
    
    // Send emails to each partner
    const results = await Promise.all(
      partners.map(async (partner) => {
        try {
          // Process template variables
          const processedContent = campaign.content
            .replace(/{{firstName}}/g, partner.contactName.split(' ')[0])
            .replace(/{{lastName}}/g, partner.contactName.split(' ')[1] || '')
            .replace(/{{companyName}}/g, partner.companyName)
            .replace(/{{partnerType}}/g, partner.type)
          
          const processedSubject = campaign.subject
            .replace(/{{companyName}}/g, partner.companyName)
          
          // Send via Mailgun
          const messageData = {
            from: process.env.FROM_EMAIL!,
            to: partner.email,
            subject: processedSubject,
            html: processedContent
          }
          
          await mg.messages.create(process.env.MAILGUN_DOMAIN!, messageData)
          return { partnerId: partner.id, success: true }
        } catch (error) {
          console.error(`Failed to send to ${partner.email}:`, error)
          return { partnerId: partner.id, success: false }
        }
      })
    )
    
    // Update campaign status
    await prisma.emailCampaign.update({
      where: { id: campaign.id },
      data: {
        status: 'sent',
        sentAt: new Date(),
        recipients: results.length
      }
    })
    
    res.json({
      success: true,
      sent: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    })
  } catch (error) {
    console.error('Error sending campaign:', error)
    res.status(500).json({ error: 'Failed to send campaign' })
  }
})

export { router as emailRoutes }