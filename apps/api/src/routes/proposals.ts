import { Router, Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth'

const router = Router()
router.use(authenticateToken as any)

// Placeholder for AI proposal routes
router.get('/', async (req: Request, res: Response): Promise<void> => {
  res.json({ message: 'Proposal routes coming soon' })
})

export { router as proposalRoutes }