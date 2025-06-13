import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'

const router = Router()
router.use(authenticateToken as any)

// Placeholder for customer management routes
router.get('/', async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Customer routes coming soon' })
})

export { router as customerRoutes }