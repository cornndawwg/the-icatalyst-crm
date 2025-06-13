import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '@icatalyst/database'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Use authentication middleware for all partner routes
router.use(authenticateToken)

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
router.get('/', async (req, res) => {
  try {
    const { organizationId } = req.user
    
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
router.get('/:id', async (req, res) => {
  try {
    const { organizationId } = req.user
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
      return res.status(404).json({ error: 'Partner not found' })
    }
    
    res.json(partner)
  } catch (error) {
    console.error('Get partner error:', error)
    res.status(500).json({ error: 'Failed to fetch partner' })
  }
})

// Create new partner
router.post('/', async (req, res) => {
  try {
    const { organizationId } = req.user
    const data = createPartnerSchema.parse(req.body)
    
    const partner = await prisma.partner.create({
      data: {
        ...data,
        organizationId,
        specialties: data.specialties?.join(',') || '',
      }
    })
    
    res.status(201).json(partner)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    console.error('Create partner error:', error)
    res.status(500).json({ error: 'Failed to create partner' })
  }
})

// Update partner
router.put('/:id', async (req, res) => {
  try {
    const { organizationId } = req.user
    const { id } = req.params
    const data = updatePartnerSchema.parse(req.body)
    
    const partner = await prisma.partner.updateMany({
      where: { 
        id,
        organizationId 
      },
      data: {
        ...data,
        ...(data.specialties && { specialties: data.specialties.join(',') }),
        updatedAt: new Date()
      }
    })
    
    if (partner.count === 0) {
      return res.status(404).json({ error: 'Partner not found' })
    }
    
    // Fetch updated partner
    const updatedPartner = await prisma.partner.findUnique({
      where: { id }
    })
    
    res.json(updatedPartner)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors })
    }
    console.error('Update partner error:', error)
    res.status(500).json({ error: 'Failed to update partner' })
  }
})

// Delete partner
router.delete('/:id', async (req, res) => {
  try {
    const { organizationId } = req.user
    const { id } = req.params
    
    const result = await prisma.partner.deleteMany({
      where: { 
        id,
        organizationId 
      }
    })
    
    if (result.count === 0) {
      return res.status(404).json({ error: 'Partner not found' })
    }
    
    res.status(204).send()
  } catch (error) {
    console.error('Delete partner error:', error)
    res.status(500).json({ error: 'Failed to delete partner' })
  }
})

// Add interaction to partner
router.post('/:id/interactions', async (req, res) => {
  try {
    const { organizationId, userId } = req.user
    const { id } = req.params
    const { type, notes, outcome } = req.body
    
    // Verify partner belongs to organization
    const partner = await prisma.partner.findFirst({
      where: { id, organizationId }
    })
    
    if (!partner) {
      return res.status(404).json({ error: 'Partner not found' })
    }
    
    const interaction = await prisma.partnerInteraction.create({
      data: {
        partnerId: id,
        type,
        notes,
        outcome,
        userId
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
        lastContactDate: new Date()
      }
    })
    
    res.status(201).json(interaction)
  } catch (error) {
    console.error('Create interaction error:', error)
    res.status(500).json({ error: 'Failed to create interaction' })
  }
})

export { router as partnerRoutes }