import { Router } from 'express'
import { authenticateToken } from '../middleware/auth'

const router = Router()
router.use(authenticateToken)

// Placeholder for customer management routes
router.get('/', (req, res) => {
  res.json({ message: 'Customer routes coming soon' })
})

export { router as customerRoutes }