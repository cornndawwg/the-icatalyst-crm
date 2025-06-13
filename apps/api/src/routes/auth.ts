import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Import Prisma from the database package
const { PrismaClient } = require('../../packages/database/node_modules/@prisma/client')

const router = Router()
const prisma = new PrismaClient()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().min(1),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// Register new organization and user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })
    
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' })
      return
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 12)
    
    // Create organization and user in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const organization = await tx.organization.create({
        data: {
          name: data.companyName,
          plan: 'starter',
          domain: data.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        }
      })
      
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'owner',
          organizationId: organization.id,
        }
      })
      
      return { organization, user }
    })
    
    // Generate JWT
    const token = jwt.sign(
      { 
        userId: result.user.id, 
        organizationId: result.organization.id,
        role: result.user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )
    
    res.status(201).json({
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors })
      return
    }
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login user
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body)
    
    // Find user with organization
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { organization: true }
    })
    
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash)
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    
    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        organizationId: user.organizationId,
        role: user.role 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors })
      return
    }
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Get current user
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      res.status(401).json({ error: 'No token provided' })
      return
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { organization: true }
    })
    
    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }
    
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
      }
    })
  } catch (error) {
    console.error('Auth verification error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
})

export { router as authRoutes }