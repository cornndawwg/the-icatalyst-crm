import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth'

// Import Prisma from the database package
const { prisma } = require('../../../packages/database/src/index.ts')

const router = Router()

// Use authentication middleware for all partner routes
router.use(authenticateToken as any)

// Validation schemas
const createPartnerSchema = z.object({
  type: z.enum(['interior-designer', 'builder', 'architect']),
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

const updatePartnerSchema = createPartnerSchema.partial()

// Get all partners for organization
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = (req as AuthenticatedRequest).user!
    
    const partners = await prisma.partner.findMany({
      where: { organizationId },
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        leads: {
          where: { status: 'active' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    res.json(partners)
  } catch (error) {
    console.error('Get partners error:', error)
    res.status(500).json({ error: 'Failed to fetch partners' })
  }
})

// Get partner by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = (req as AuthenticatedRequest).user!
    const { id } = req.params
    
    const partner = await prisma.partner.findFirst({
      where: { 
        id,
        organizationId 
      },
      include: {
        interactions: {
          orderBy: { createdAt: 'desc' }
        },
        leads: {
          include: {
            customer: true
          }
        }
      }
    })
    
    if (!partner) {
      res.status(404).json({ error: 'Partner not found' })
      return
    }
    
    res.json(partner)
  } catch (error) {
    console.error('Get partner error:', error)
    res.status(500).json({ error: 'Failed to fetch partner' })
  }
})

// Create new partner
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = (req as AuthenticatedRequest).user!
    const data = createPartnerSchema.parse(req.body)
    
    const partner = await prisma.partner.create({
      data: {
        ...data,
        organizationId,
        specialties: data.specialties || [],
      }
    })
    
    res.status(201).json(partner)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors })
      return
    }
    console.error('Create partner error:', error)
    res.status(500).json({ error: 'Failed to create partner' })
  }
})

// Update partner
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = (req as AuthenticatedRequest).user!
    const { id } = req.params
    const data = updatePartnerSchema.parse(req.body)
    
    const partner = await prisma.partner.updateMany({
      where: { 
        id,
        organizationId 
      },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
    
    if (partner.count === 0) {
      res.status(404).json({ error: 'Partner not found' })
      return
    }
    
    // Fetch updated partner
    const updatedPartner = await prisma.partner.findUnique({
      where: { id }
    })
    
    res.json(updatedPartner)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors })
      return
    }
    console.error('Update partner error:', error)
    res.status(500).json({ error: 'Failed to update partner' })
  }
})

// Delete partner
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId } = (req as AuthenticatedRequest).user!
    const { id } = req.params
    
    const result = await prisma.partner.deleteMany({
      where: { 
        id,
        organizationId 
      }
    })
    
    if (result.count === 0) {
      res.status(404).json({ error: 'Partner not found' })
      return
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Delete partner error:', error)
    res.status(500).json({ error: 'Failed to delete partner' })
  }
})

// Add interaction to partner
router.post('/:id/interactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { organizationId, userId } = (req as AuthenticatedRequest).user!
    const { id } = req.params
    const { type, subject, description, outcome } = req.body
    
    // Verify partner belongs to organization
    const partner = await prisma.partner.findFirst({
      where: { id, organizationId }
    })
    
    if (!partner) {
      res.status(404).json({ error: 'Partner not found' })
      return
    }
    
    const interaction = await prisma.partnerInteraction.create({
      data: {
        partnerId: id,
        type,
        subject,
        description,
        outcome,
        createdBy: userId
      }
    })
    
    // Update partner relationship score based on interaction
    const scoreIncrement = outcome === 'positive' ? 10 : outcome === 'negative' ? -5 : 5
    await prisma.partner.update({
      where: { id },
      data: {
        relationshipScore: {
          increment: scoreIncrement
        },
        lastContact: new Date()
      }
    })
    
    res.status(201).json(interaction)
  } catch (error) {
    console.error('Create interaction error:', error)
    res.status(500).json({ error: 'Failed to create interaction' })
  }
})

export { router as partnerRoutes }