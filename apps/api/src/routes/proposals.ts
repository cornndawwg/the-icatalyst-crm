import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'

const router = Router()
router.use(authenticateToken)

// Placeholder for AI proposal routes
router.get('/', (req, res) => {
  res.json({ message: 'Proposal routes coming soon' })
})

export { router as proposalRoutes }