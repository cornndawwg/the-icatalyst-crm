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

// Placeholder for email campaign routes
router.get('/campaigns', async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Email campaign routes coming soon' })
})

export { router as emailRoutes }